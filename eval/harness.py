"""Eval harness for FSMS RAG chatbot — LangSmith test suite.

Usage:
    uv run python eval/harness.py --api-url http://localhost:8000
    uv run python eval/harness.py --api-url https://fsms-backend.onrender.com
"""

import argparse
import asyncio
import json
import os
import re
import sys
import time
from datetime import UTC, datetime
from pathlib import Path

import httpx

HERE = Path(__file__).resolve().parent
DEFAULT_QUESTIONS = HERE / "questions.json"
DEFAULT_OUTPUT_DIR = HERE / "results"

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
Ignore wording differences — focus on factual correctness.
Reply with exactly "PASS" or "FAIL"."""

RESULTS_SCHEMA_VERSION = 1


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower().strip())


def extract_numbers(text: str) -> list[str]:
    return re.findall(r"\$?\d+(?:,\d{3})*(?:\.\d+)?%?", text)


def refusal_check(response: str) -> bool:
    return any(signal in response.lower() for signal in REFUSAL_SIGNALS)


def exact_match(expected: str, actual: str) -> bool:
    return normalize(expected) == normalize(actual)


def pricing_numbers_match(expected: str, actual: str) -> bool:
    exp_nums = extract_numbers(expected)
    act_nums = extract_numbers(actual)
    return sorted(exp_nums) == sorted(act_nums)


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


async def score_question_llm(
    client: httpx.AsyncClient,
    question: str,
    expected_answer: str,
    response_text: str,
    judge_model: str,
    openrouter_api_key: str,
    timeout: float = 15.0,
) -> tuple[bool, str]:
    prompt = build_judge_prompt(question, expected_answer, response_text)
    payload = {
        "model": judge_model,
        "messages": [
            {"role": "system", "content": JUDGE_SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.0,
        "max_tokens": 10,
    }
    try:
        resp = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {openrouter_api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=timeout,
        )
        resp.raise_for_status()
        result = resp.json()
        content = result["choices"][0]["message"]["content"].strip().upper()
        passed = "PASS" in content
        return passed, content
    except Exception as e:  # noqa: BLE001
        return False, f"judge_error: {e}"


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
            return False, "pricing_number_mismatch", "numbers differ"
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
) -> tuple[str, float, str | None]:
    tokens: list[str] = []
    citations = None
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
                elif data.get("type") == "done":
                    break
    except httpx.ConnectError:
        return "", 0.0, "connection_error"
    except httpx.TimeoutException:
        return "", 0.0, "timeout_error"
    except httpx.HTTPStatusError as e:
        return "", 0.0, f"http_error_{e.response.status_code}"

    elapsed = time.monotonic() - start
    return "".join(tokens), elapsed, citations


async def run_question(
    client: httpx.AsyncClient,
    q: dict,
    api_url: str,
    judge_model: str,
    openrouter_api_key: str,
) -> dict:
    category = q["category"]
    is_multi_turn = category == "multi_turn" and q["multi_turn_chain"] is not None

    if is_multi_turn:
        return await run_multi_turn_question(
            client, q, api_url, judge_model, openrouter_api_key
        )

    session_id = None
    payload = {"message": q["question"], "session_id": session_id}
    response_text, latency, error = await collect_sse_stream(
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
            "citation_present": False,
        }

    if category == "pricing":
        passed, method, detail = score_question(q, response_text)
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
            "citation_present": False,
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
            "citation_present": False,
        }

    else:
        llm_passed, llm_detail = await score_question_llm(
            client, q["question"], q["expected_answer"], response_text,
            judge_model, openrouter_api_key,
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
            "citation_present": False,
        }


async def run_multi_turn_question(
    client: httpx.AsyncClient,
    q: dict,
    api_url: str,
    judge_model: str,
    openrouter_api_key: str,
) -> dict:
    session_id = None
    all_passed = True
    sub_results = []

    for i, turn in enumerate(
        [{"question": q["question"], "expected_answer": q["expected_answer"]}]
        + q["multi_turn_chain"]
    ):
        payload = {"message": turn["question"], "session_id": session_id}
        response_text, _latency, error = await collect_sse_stream(
            client, f"{api_url}/api/chat", payload
        )
        if error:
            sub_results.append({
                "turn": i,
                "passed": False,
                "error": error,
            })
            all_passed = False
            continue

        if response_text is None:
            response_text = ""

        norm_exp = normalize(turn["expected_answer"])
        norm_resp = normalize(response_text)
        turn_passed = norm_exp in norm_resp or norm_resp in norm_exp

        if not turn_passed:
            llm_passed, _ = await score_question_llm(
                client, turn["question"], turn["expected_answer"],
                response_text, judge_model, openrouter_api_key,
            )
            turn_passed = llm_passed

        if not turn_passed:
            all_passed = False

        sub_results.append({
            "turn": i,
            "passed": turn_passed,
            "question": turn["question"],
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
        "citation_present": False,
        "sub_results": sub_results,
    }


def compute_summary(results: list[dict]) -> dict:
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
        "timestamp": datetime.now(UTC).isoformat(),
        "total": total,
        "passed": passed,
        "answerable_accuracy": round(answerable_passed / answerable_total, 4) if answerable_total else 0,
        "refusal_accuracy": round(refusal_passed / refusal_total, 4) if refusal_total else 0,
        "pricing_violations": pricing_violations,
        "p95_latency_ms": p95,
        "by_category": by_category,
        "hard_fail": pricing_violations > 0,
    }


def write_results(results: list[dict], summary: dict, output_dir: Path):
    output_dir.mkdir(parents=True, exist_ok=True)
    ts = datetime.now(UTC).strftime("%Y%m%dT%H%M%SZ")
    path = output_dir / f"{ts}.json"

    report = {
        "schema_version": RESULTS_SCHEMA_VERSION,
        "summary": summary,
        "results": results,
    }
    path.write_text(json.dumps(report, indent=2))
    return path


def print_summary(summary: dict):
    s = summary
    print()
    print("=" * 60)
    print("EVAL RESULTS")
    print("=" * 60)
    print(f"  Timestamp:          {s['timestamp']}")
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
    parser = argparse.ArgumentParser(
        description="FSMS RAG chatbot eval harness"
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
        "--judge-model",
        default="mistralai/mixtral-8x7b-instruct",
        help="OpenRouter model ID for LLM-as-judge (default: mistralai/mixtral-8x7b-instruct)",
    )
    parser.add_argument(
        "--concurrency",
        type=int,
        default=5,
        help="Max concurrent questions (default: 5)",
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

    api_key = os.getenv("OPENROUTER_API_KEY", "")
    judge_model = args.judge_model

    output_dir = Path(args.output_dir)

    api_url = args.api_url.rstrip("/")

    print(f"Eval harness targeting {api_url}")
    print(f"  Questions: {len(questions)}")
    print(f"  Judge model: {judge_model}")
    print(f"  Output dir: {output_dir}")
    print(f"  Concurrency: {args.concurrency}")
    print()

    semaphore = asyncio.Semaphore(args.concurrency)

    async def run_question_with_semaphore(
        client: httpx.AsyncClient, q: dict
    ) -> dict:
        async with semaphore:
            return await run_question(
                client, q, api_url, judge_model, api_key
            )

    async with httpx.AsyncClient(timeout=30.0) as client:
        tasks = [run_question_with_semaphore(client, q) for q in questions]
        results = await asyncio.gather(*tasks)

    summary = compute_summary(results)
    out_path = write_results(results, summary, output_dir)
    print_summary(summary)
    print(f"\nResults written to: {out_path}")

    if summary["hard_fail"]:
        sys.exit(1)


def main():
    asyncio.run(amain())


if __name__ == "__main__":
    main()
