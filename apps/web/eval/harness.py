"""Eval harness for Veracity RAG chatbot — LangSmith test suite.

Usage:
    uv run python eval/harness.py --api-url http://localhost:8000
    uv run python eval/harness.py --api-url https://veracity-backend.onrender.com
"""

import argparse
import asyncio
import json
import re
import secrets
import sys
import time
from datetime import UTC, datetime
from pathlib import Path

import httpx
from dotenv import load_dotenv

HERE = Path(__file__).resolve().parent
DEFAULT_QUESTIONS = HERE / "questions.json" #golden dataset
DEFAULT_OUTPUT_DIR = HERE / "results" #eval results

load_dotenv(Path(__file__).resolve().parents[1] / "backend" / ".env")

BACKEND_DIR = Path(__file__).resolve().parents[1] / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))
from config import LLM_PROVIDERS
from llm import ChatProvider, ModelUnavailable, ProviderError, get_provider

# Judge provider: default to the first configured chat provider so the eval
# harness follows the same LLM_PROVIDERS chain as the backend chat endpoint.
DEFAULT_JUDGE_PROVIDER = (LLM_PROVIDERS[0] if LLM_PROVIDERS else "openrouter").strip()

REFUSAL_SIGNALS = [
    "i don't know",
    "i can't answer",
    "i'm not sure",
    "i don't have",
    "cannot answer",
    "unable to answer",
    "contact us",
    "contact our",
    "reach out to",
    "not covered",
    "isn't covered",
    "doesn't cover",
    "can't find",
    "couldn't find",
    "no information",
    "not mentioned",
]

JUDGE_SYSTEM_PROMPT = """You are evaluating a chatbot response for accuracy.
The chatbot answers questions using only content from its own website.
Reply PASS if the response is factually correct on the point asked, even if it
omits some elaborations from the expected answer or adds extra correct details.
Reply FAIL only if the response states something factually wrong or contradicts
the site content. Reply with exactly "PASS" or "FAIL"."""

PRICING_JUDGE_SYSTEM_PROMPT = """You are evaluating a chatbot response about pricing or plan terms.
The chatbot answers using only content from its own website.
The expected answer states the exact published price, term, or feature inclusion.
Reply PASS if the response is factually correct on the point asked, even if it
omits some elaborations from the expected answer or adds extra correct details.
Reply FAIL only if the response states something factually wrong or contradicts
the expected price, term, or feature inclusion. Reply with exactly "PASS" or "FAIL"."""

RESULTS_SCHEMA_VERSION = 1


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower().strip())


def extract_numbers(text: str) -> list[str]:
    return re.findall(r"\$?\d+(?:,\d{3})*(?:\.\d+)?%?", text)


def pricing_numbers_match(expected: str, actual: str) -> bool:
    def normalize_num(n: str) -> str:
        return n.replace(",", "").replace("$", "").replace("%", "").rstrip(".")
    exp_nums = {normalize_num(n) for n in extract_numbers(expected)}
    act_nums = {normalize_num(n) for n in extract_numbers(actual)}
    if not exp_nums:
        return True
    return exp_nums <= act_nums


def refusal_check(response: str) -> bool:
    return any(signal in response.lower() for signal in REFUSAL_SIGNALS)


def exact_match(expected: str, actual: str) -> bool:
    return normalize(expected) == normalize(actual)


def build_judge_prompt(question: str, expected_answer: str, response: str) -> str:
    return (
        f"Question: {question}\n\n"
        f"Expected answer: {expected_answer}\n\n"
        f"Chatbot response: {response}\n\n"
        f"Does the response correctly answer the question using only information "
        f"from the site content?\n"
        f"Ignore wording differences — focus on factual correctness.\n"
        f"Reply with exactly \"PASS\" or \"FAIL\"."
    )


JUDGE_MAX_ATTEMPTS = 3
JUDGE_BACKOFF_SECONDS = 1.5


async def score_question_llm(
    judge_provider: ChatProvider,
    question: str,
    expected_answer: str,
    response_text: str,
    judge_model: str,
    system_prompt: str = JUDGE_SYSTEM_PROMPT,
) -> tuple[bool, str, float]:
    """Score one response with the LLM judge.

    Returns ``(passed, verdict, judge_ms)`` where ``judge_ms`` is how long the
    judge call(s) took — recorded so the eval report can separate *backend*
    latency (measured client-side against /api/chat) from *judge* latency.
    """
    prompt = build_judge_prompt(question, expected_answer, response_text)
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": prompt},
    ]
    last_error: str | None = None
    judge_start = time.monotonic()
    for attempt in range(JUDGE_MAX_ATTEMPTS):
        try:
            content = await judge_provider.complete(
                messages,
                model=judge_model,
                temperature=0.0,
                max_tokens=128,
            )
            verdict = content.strip().upper()
            judge_ms = (time.monotonic() - judge_start) * 1000
            return "PASS" in verdict, verdict, judge_ms
        except ModelUnavailable as e:
            # Upstream quota/rate-limit: back off and retry the same judge model.
            last_error = f"judge_error: http_{e.status}"
            await asyncio.sleep(JUDGE_BACKOFF_SECONDS * (attempt + 1))
            continue
        except ProviderError as e:
            # Terminal provider failure: record it; do not retry.
            return False, f"judge_error: {e}", (time.monotonic() - judge_start) * 1000
    return False, last_error or "judge_error: exhausted", (time.monotonic() - judge_start) * 1000


def score_question(
    q: dict,
    response_text: str,
) -> tuple[bool, str, str]:
    category = q["category"]
    expected = q["expected_answer"]

    if category == "pricing":
        if exact_match(expected, response_text):
            return True, "exact_match", ""
        if pricing_numbers_match(expected, response_text):
            return True, "pricing_numbers_match", ""
        return False, "pricing_mismatch", ""

    if category == "unanswerable":
        if refusal_check(response_text):
            return True, "refusal", ""
        return False, "answered_when_should_refuse", ""

    if category == "multi_turn":
        if exact_match(expected, response_text):
            return True, "exact_match", ""
        return False, "multi_turn_mismatch", ""

    return False, "unscored", "needs llm_as_judge"


async def collect_sse_stream(
    client: httpx.AsyncClient, url: str, payload: dict, timeout: float = 30.0
) -> tuple[str, float, str | None, str | None, str | None]:
    tokens: list[str] = []
    citations = None
    session_id = None
    stream_error = None
    start = time.monotonic()
    first_token = None
    try:
        async with client.stream(
            "POST", url, json=payload, timeout=timeout
        ) as resp:
            resp.raise_for_status()
            async for line in resp.aiter_lines():
                if not line.startswith("data: "):
                    continue
                data_str = line[6:]
                try:
                    data = json.loads(data_str)
                except json.JSONDecodeError:
                    continue
                if first_token is None:
                    first_token = time.monotonic()
                if data.get("type") == "token":
                    tokens.append(data.get("content", ""))
                elif data.get("type") == "citations":
                    citations = json.dumps(data.get("sources", []))
                elif data.get("type") == "session":
                    session_id = data.get("session_id")
                elif data.get("type") == "error":
                    stream_error = data.get("message") or "upstream_error"
                    break
                elif data.get("type") == "done":
                    break
    except httpx.ConnectError:
        return "", 0.0, None, None, "connection_error"
    except httpx.TimeoutException:
        return "", 0.0, None, None, "timeout_error"
    except httpx.HTTPStatusError as e:
        return "", 0.0, None, None, f"http_error_{e.response.status_code}"

    elapsed = time.monotonic() - start
    if stream_error:
        return "", elapsed, citations, session_id, stream_error
    return "".join(tokens), elapsed, citations, session_id, None


async def run_question(
    client: httpx.AsyncClient,
    q: dict,
    api_url: str,
    judge_provider: ChatProvider,
    judge_model: str,
) -> dict:
    category = q["category"]
    is_multi_turn = category == "multi_turn" and q["multi_turn_chain"] is not None

    if is_multi_turn:
        return await run_multi_turn_question(
            client, q, api_url, judge_provider, judge_model
        )

    session_id = None
    payload = {"message": q["question"], "session_id": session_id}
    response_text, latency, citations, _, error = await collect_sse_stream(
        client, f"{api_url}/api/chat", payload
    )

    if error:
        return {
            "id": q["id"],
            "category": category,
            "passed": False,
            "score_method": "error",
            "details": error,
            "latency_ms": round(latency * 1000),
            "error": True,
            "pricing_violation": False,
            "citation_present": bool(citations),
        }

    if category == "pricing":
        passed, method, detail = score_question(q, response_text)
        judge_ms = 0.0
        if not passed:
            judge_passed, judge_detail, judge_ms = await score_question_llm(
                judge_provider,
                q["question"], q["expected_answer"], response_text,
                judge_model,
                system_prompt=PRICING_JUDGE_SYSTEM_PROMPT,
            )
            passed = judge_passed
            method = "pricing_judge" if judge_passed else "pricing_judge_fail"
            detail = judge_detail
        pricing_violation = not passed
        return {
            "id": q["id"],
            "category": category,
            "passed": passed,
            "score_method": method,
            "details": detail or response_text[:200],
            "latency_ms": round(latency * 1000),
            "error": False,
            "pricing_violation": pricing_violation,
            "citation_present": bool(citations),
            "judge_ms": round(judge_ms, 1),
        }

    elif category == "unanswerable":
        passed, method, detail = score_question(q, response_text)
        return {
            "id": q["id"],
            "category": category,
            "passed": passed,
            "score_method": method,
            "details": detail,
            "latency_ms": round(latency * 1000),
            "error": False,
            "pricing_violation": False,
            "citation_present": bool(citations),
            "judge_ms": 0.0,
        }

    else:
        llm_passed, llm_detail, judge_ms = await score_question_llm(
            judge_provider,
            q["question"], q["expected_answer"], response_text,
            judge_model,
        )
        return {
            "id": q["id"],
            "category": category,
            "passed": llm_passed,
            "score_method": "llm_as_judge",
            "details": llm_detail,
            "latency_ms": round(latency * 1000),
            "error": False,
            "pricing_violation": False,
            "citation_present": bool(citations),
            "judge_ms": round(judge_ms, 1),
        }


async def run_multi_turn_question(
    client: httpx.AsyncClient,
    q: dict,
    api_url: str,
    judge_provider: ChatProvider,
    judge_model: str,
) -> dict:
    session_id = None
    all_passed = True
    sub_results = []
    multi_citations = []

    for i, turn in enumerate(
        [{"question": q["question"], "expected_answer": q["expected_answer"]}]
        + q["multi_turn_chain"]
    ):
        payload = {"message": turn["question"], "session_id": session_id}
        response_text, _latency, citations, new_session_id, error = await collect_sse_stream(
            client, f"{api_url}/api/chat", payload
        )
        if new_session_id:
            session_id = new_session_id
        if error:
            if citations:
                multi_citations.append(citations)
            sub_results.append({
                "turn": i,
                "passed": False,
                "error": error,
            })
            all_passed = False
            continue
        if citations:
            multi_citations.append(citations)

        if response_text is None:
            response_text = ""

        norm_exp = normalize(turn["expected_answer"])
        norm_resp = normalize(response_text)
        turn_passed = norm_exp in norm_resp or norm_resp in norm_exp
        judge_ms = 0.0

        if not turn_passed:
            llm_passed, _, judge_ms = await score_question_llm(
                judge_provider,
                turn["question"], turn["expected_answer"],
                response_text, judge_model,
            )
            turn_passed = llm_passed

        if not turn_passed:
            all_passed = False

        sub_results.append({
            "turn": i,
            "passed": turn_passed,
            "question": turn["question"],
            "judge_ms": round(judge_ms, 1),
        })

    return {
        "id": q["id"],
        "category": "multi_turn",
        "passed": all_passed,
        "score_method": "multi_turn",
        "details": json.dumps(sub_results),
        "latency_ms": round(sum(r.get("latency_ms", 0) for r in sub_results if isinstance(r, dict) and "latency_ms" in r)),
        "error": False,
        "pricing_violation": False,
        "citation_present": bool(multi_citations),
        "sub_results": sub_results,
        "judge_ms": round(sum(r.get("judge_ms", 0) for r in sub_results), 1),
    }


def compute_summary(results: list[dict], judge_model: str, run_id: str = "") -> dict:
    total = len(results)
    passed = sum(1 for r in results if r.get("passed"))
    latencies = [r["latency_ms"] for r in results if not r.get("error")]

    by_category: dict[str, dict] = {}
    for r in results:
        cat = r["category"]
        if cat not in by_category:
            by_category[cat] = {"total": 0, "passed": 0}
        by_category[cat]["total"] += 1
        if r.get("passed"):
            by_category[cat]["passed"] += 1

    pricing_violations = sum(
        1 for r in results if r.get("pricing_violation")
    )

    answerable_cats = {"answerable_single", "cross_product", "multi_turn"}
    answerable_total = sum(
        by_category[c]["total"] for c in answerable_cats if c in by_category
    )
    answerable_passed = sum(
        by_category[c]["passed"] for c in answerable_cats if c in by_category
    )

    refusal_total = by_category.get("unanswerable", {}).get("total", 0)
    refusal_passed = by_category.get("unanswerable", {}).get("passed", 0)

    sorted_lat = sorted(latencies) if latencies else [0]
    p95 = sorted_lat[int(len(sorted_lat) * 0.95)] if sorted_lat else 0

    return {
        "run_id": run_id,
        "timestamp": datetime.now(UTC).isoformat(),
        "judge_model": judge_model,
        "total": total,
        "passed": passed,
        "answerable_accuracy": round(answerable_passed / answerable_total, 4) if answerable_total else 0,
        "refusal_accuracy": round(refusal_passed / refusal_total, 4) if refusal_total else 0,
        "pricing_violations": pricing_violations,
        "p95_latency_ms": p95,
        "by_category": by_category,
        "hard_fail": pricing_violations > 0,
    }


def write_results(results: list[dict], summary: dict, output_dir: Path, ts: str):
    output_dir.mkdir(parents=True, exist_ok=True)
    path = output_dir / f"{ts}.json"

    report = {
        "schema_version": RESULTS_SCHEMA_VERSION,
        "summary": summary,
        "results": results,
    }
    path.write_text(json.dumps(report, indent=2))
    return path


class JsonlEventWriter:
    """Append JSON events to a .jsonl file, safely from concurrent tasks.

    Each line is one machine-readable event (run_started / question_scored /
    run_completed). This is the "per-question structured log" of an eval run:
    a single `jq` filter over the file answers e.g. "which questions were
    judged by LLM, and how slow were those judge calls?"
    """

    def __init__(self, path: Path):
        self._path = path
        self._lock = asyncio.Lock()
        self._fh = path.open("a", encoding="utf-8")

    async def write(self, event: dict):
        """Serialize one event to one JSON line (atomic under the lock)."""
        async with self._lock:
            self._fh.write(json.dumps(event, default=str) + "\n")
            self._fh.flush()

    def close(self):
        self._fh.close()


def print_summary(summary: dict):
    s = summary
    print()
    print("=" * 60)
    print("EVAL RESULTS")
    print("=" * 60)
    print(f"  Timestamp:          {s['timestamp']}")
    print(f"  Judge model:        {s.get('judge_model', 'n/a')}")
    print(f"  Total questions:    {s['total']}")
    print(f"  Overall passed:     {s['passed']}/{s['total']}")
    print(f"  Answerable acc:     {s['answerable_accuracy']:.1%}")
    print(f"  Refusal accuracy:   {s['refusal_accuracy']:.1%}")
    print(f"  Pricing violations: {s['pricing_violations']}")
    print(f"  p95 latency (ms):   {s['p95_latency_ms']}")
    print(f"  Hard fail:          {'YES' if s['hard_fail'] else 'no'}")
    print()
    for cat, stats in s.get("by_category", {}).items():
        print(f"  {cat:25s} {stats['passed']}/{stats['total']}")
    print("=" * 60)


async def amain():
    #create a parser instance to parse the cli arguments
    parser = argparse.ArgumentParser(
        description="Veracity RAG chatbot eval harness"
    )
    parser.add_argument("--api-url", required=True, help="Base URL of the FastAPI backend")
    parser.add_argument(
        "--questions",
        default=str(DEFAULT_QUESTIONS), 
        help=f"Path to questions JSON (default: {DEFAULT_QUESTIONS})",
    )
    parser.add_argument(
        "--output-dir",
        default=str(DEFAULT_OUTPUT_DIR),
        help=f"Output directory for results (default: {DEFAULT_OUTPUT_DIR})",
    )
    parser.add_argument(
        "--judge-provider",
        default=DEFAULT_JUDGE_PROVIDER,
        help=f"Provider for LLM-as-judge (default: {DEFAULT_JUDGE_PROVIDER})",
    )
    parser.add_argument(
        "--judge-model",
        default="",
        help="Model ID for LLM-as-judge (default: first model of the judge provider)",
    )
    parser.add_argument(
        "--concurrency",
        type=int,
        default=5,
        help="Max concurrent questions (default: 5)",
    )
    parser.add_argument(
        "--question-delay",
        type=float,
        default=0.0,
        help="Seconds to wait between starting each question. Use to pace a run "
        "under a provider's per-minute rate limit (e.g. Gemini free tier is "
        "15 requests/min/model; ~2.0s keeps a single-threaded run under it)",
    )
    args = parser.parse_args()

    questions_path = Path(args.questions)
    if not questions_path.exists():
        print(f"ERROR: Questions file not found: {questions_path}", file=sys.stderr)
        sys.exit(2)

    with open(questions_path) as f:  # noqa: ASYNC230
        questions = json.load(f)

    if not isinstance(questions, list) or len(questions) == 0:
        print("ERROR: Questions file must contain a non-empty array", file=sys.stderr)
        sys.exit(2)

    # Build the judge from the configured provider (reads backend/.env keys).
    judge_provider = get_provider(args.judge_provider)
    judge_model = args.judge_model or judge_provider.default_model

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    # One timestamp prefixes BOTH the results JSON and the per-question event
    # stream, so the two files for a single run are always findable together.
    ts = datetime.now(UTC).strftime("%Y%m%dT%H%M%SZ")
    run_id = f"{ts}-{secrets.token_hex(4)}"
    events_path = output_dir / f"{ts}.events.jsonl"

    api_url = args.api_url.rstrip("/")

    print(f"Eval harness targeting {api_url}")
    print(f"  Run id: {run_id}")
    print(f"  Questions: {len(questions)}")
    print(f"  Judge provider: {args.judge_provider}")
    print(f"  Judge model: {judge_model}")
    print(f"  Output dir: {output_dir}")
    print(f"  Concurrency: {args.concurrency}")
    print()

    event_writer = JsonlEventWriter(events_path)
    await event_writer.write({
        "event": "run_started",
        "run_id": run_id,
        "timestamp": datetime.now(UTC).isoformat(),
        "api_url": api_url,
        "judge_provider": args.judge_provider,
        "judge_model": judge_model,
        "concurrency": args.concurrency,
        "question_delay": args.question_delay,
        "total_questions": len(questions),
    })

    semaphore = asyncio.Semaphore(args.concurrency)
    delay_between_questions = max(0.0, args.question_delay)

    async def run_question_with_semaphore(
        client: httpx.AsyncClient, q: dict
    ) -> dict:
        async with semaphore:
            result = await run_question(
                client, q, api_url, judge_provider, judge_model
            )
            # Emit the per-question event as soon as it completes, so a long
            # run can be tailed (`tail -f *.events.jsonl`) while still running.
            await event_writer.write({
                "event": "question_scored",
                "run_id": run_id,
                "judge_model": judge_model,
                **result,
            })
            if delay_between_questions:
                # Pace the start of the next question (best-effort rate limit).
                await asyncio.sleep(delay_between_questions)
            return result

    async with httpx.AsyncClient(timeout=30.0) as client:
        tasks = [run_question_with_semaphore(client, q) for q in questions]
        results = await asyncio.gather(*tasks)

    summary = compute_summary(results, judge_model, run_id=run_id)
    await event_writer.write({
        "event": "run_completed",
        "run_id": run_id,
        "timestamp": summary["timestamp"],
        "summary": summary,
    })
    event_writer.close()

    out_path = write_results(results, summary, output_dir, ts)
    print_summary(summary)
    print(f"\nResults written to: {out_path}")
    print(f"Event stream written to: {events_path}")

    if summary["hard_fail"]:
        sys.exit(1)


def main():
    asyncio.run(amain())


if __name__ == "__main__":
    main()
