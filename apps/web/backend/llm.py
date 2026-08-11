"""Provider-agnostic LLM client layer for the Veracity RAG backend.

This module is the single seam between the RAG pipeline / eval harness and
external LLM providers. Callers depend only on the ``ChatProvider`` interface
below — never on a specific vendor's wire format. Adding a new provider means
implementing one class and registering it in ``PROVIDER_REGISTRY``; no code
that calls ``stream_chat()`` changes.

Design notes (Open/Closed Principle):
  * ``ChatProvider.stream_chat()`` is the one abstraction the pipeline uses:
    "stream tokens for these messages." Everything vendor-specific (payload
    shape, auth header, SSE parsing, error semantics) is encapsulated inside a
    concrete provider.
  * ``ChatProvider.complete()`` is implemented in the base class by joining the
    token stream, so non-streaming callers (e.g. the eval judge) need no extra
    code and no vendor-specific non-streaming endpoint.
  * A provider raises ``ModelUnavailable`` when a model is temporarily
    unavailable (rate limit, exhausted quota, 5xx) so the caller can rotate to
    the next model in the chain. Terminal failures raise ``ProviderError``.

Providers implemented today:
  * ``OpenRouterProvider`` — OpenRouter free-tier chat completions (the
    historical default; keeps the multi-model fallback chain working).
  * ``GeminiProvider`` — Google Gemini Generative Language API (native REST).
  * ``OpenAICompatibleProvider`` — base class for any OpenAI-style
    ``/chat/completions`` endpoint (Groq and friends drop in via a small
    subclass + registry entry, no other code changes).
"""

from __future__ import annotations

import abc
import json
import logging
from collections.abc import AsyncIterator
from contextvars import ContextVar
from dataclasses import dataclass
from typing import ClassVar

import httpx

logger = logging.getLogger(__name__)

# A streaming request that has produced no output for this long is treated as
# an upstream stall and surfaces as ProviderError (fail fast, don't hang).
HTTP_TIMEOUT_SECONDS = 60.0


@dataclass
class UsageStats:
    """Token usage for the most recent provider call in the current request.

    Populated from each provider's streaming usage metadata (Gemini sends
    ``usageMetadata`` on every chunk; OpenRouter sends ``usage`` on the final
    chunk). Stored in a ContextVar so the RAG pipeline can read it after the
    stream finishes without changing any provider signatures.
    """

    prompt_tokens: int = 0
    completion_tokens: int = 0

    @property
    def total_tokens(self) -> int:
        return self.prompt_tokens + self.completion_tokens


_usage_var: ContextVar[UsageStats | None] = ContextVar("veracity_llm_usage", default=None)


def current_usage() -> UsageStats:
    """The usage accumulator for the current request/stream."""
    usage = _usage_var.get()
    if usage is None:
        usage = UsageStats()
        _usage_var.set(usage)
    return usage


class ProviderError(Exception):
    """A terminal failure talking to an LLM provider (no chain rotation)."""


class ModelUnavailable(ProviderError):
    """A retryable upstream failure; the caller should try the next model.

    ``status`` is an HTTP-ish status code (e.g. 429 for rate limit / quota
    exhaustion, 402 for missing credits, 503 for upstream outage).
    """

    def __init__(self, provider: str, model: str, status: int, detail: str = ""):
        self.provider = provider
        self.model = model
        self.status = status
        self.detail = detail
        super().__init__(f"Provider {provider} model {model} unavailable (HTTP {status})")


class ChatProvider(abc.ABC):
    """Abstract chat-completions provider.

    Concrete providers implement ``stream_chat()`` only; ``complete()`` is a
    convenience that joins the stream for non-streaming callers.
    """

    # Stable lowercase identifier (matches PROVIDER_REGISTRY keys and the
    # metrics/log labels). Subclasses override it.
    name: ClassVar[str] = ""

    def __init__(self, api_key: str, base_url: str, models: list[str] | None = None):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.models = list(models or [])

    @property
    def default_model(self) -> str:
        """First model in this provider's configured chain (empty if none)."""
        return self.models[0] if self.models else ""

    @abc.abstractmethod
    def stream_chat(
        self,
        messages: list[dict[str, str]],
        *,
        model: str,
        temperature: float = 0.0,
        max_tokens: int = 1024,
    ) -> AsyncIterator[str]:
        """Stream completion tokens for ``messages``.

        Implementations are async generators. Raises:
            ModelUnavailable: model is temporarily unavailable — caller may
                retry on the next model in the chain.
            ProviderError: terminal failure — do not retry.
        """

    async def complete(
        self,
        messages: list[dict[str, str]],
        *,
        model: str,
        temperature: float = 0.0,
        max_tokens: int = 512,
    ) -> str:
        """Return a full (non-streaming) completion by joining the token stream."""
        tokens = [
            token
            async for token in self.stream_chat(
                messages, model=model, temperature=temperature, max_tokens=max_tokens
            )
        ]
        return "".join(tokens)


class OpenAICompatibleProvider(ChatProvider):
    """Base class for providers exposing an OpenAI-style chat completions API.

    Covers OpenRouter today and Groq later. Subclasses only configure the
    endpoint, auth extras, retryable statuses, and their default model list.
    """

    # HTTP statuses that mean "temporarily unavailable, rotate to next model".
    # 402 = no credits on the key, 404 = model dropped from the free tier,
    # 429 = rate limited/exhausted, 5xx = upstream failure.
    retryable_statuses: frozenset[int] = frozenset({402, 404, 408, 409, 429, 500, 502, 503, 504})

    # Extra headers sent with every request (e.g. vendor attribution).
    extra_headers: ClassVar[dict[str, str]] = {}

    # Name reported in metrics/logs; subclasses set it.
    name: ClassVar[str] = "openai-compatible"

    async def stream_chat(
        self,
        messages: list[dict[str, str]],
        *,
        model: str,
        temperature: float = 0.0,
        max_tokens: int = 1024,
    ) -> AsyncIterator[str]:
        if not self.api_key:
            raise ProviderError(
                f"API key not configured for provider '{type(self).__name__}'. "
                "Set the corresponding *_API_KEY in backend/.env."
            )

        payload = {
            "model": model,
            "messages": messages,
            "stream": True,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            **self.extra_headers,
        }
        url = f"{self.base_url}/chat/completions"

        async with (
            httpx.AsyncClient(timeout=HTTP_TIMEOUT_SECONDS) as client,
            client.stream("POST", url, json=payload, headers=headers) as resp,
        ):
                if resp.status_code != 200:
                    err_body = (await resp.aread()).decode(errors="replace")
                    logger.error(
                        "openai_compatible_upstream_error",
                        extra={
                            "provider": self.name,
                            "model": model,
                            "status": resp.status_code,
                            "error_body": err_body,
                        },
                    )
                    if resp.status_code in self.retryable_statuses:
                        raise ModelUnavailable(self.name, model, resp.status_code, err_body)
                    raise ProviderError(
                        f"{self.name} upstream HTTP {resp.status_code}: {err_body}"
                    )

                async for line in resp.aiter_lines():
                    line = line.strip()
                    if not line:
                        continue
                    if line == "data: [DONE]":
                        return
                    if not line.startswith("data: "):
                        continue
                    try:
                        chunk = json.loads(line[6:])
                    except json.JSONDecodeError:
                        continue
                    # OpenRouter streams a `usage` object on the final chunk;
                    # capture it so the pipeline can log tokens consumed.
                    usage = chunk.get("usage") or {}
                    if usage:
                        usage_stats = current_usage()
                        usage_stats.prompt_tokens = int(usage.get("prompt_tokens") or 0)
                        usage_stats.completion_tokens = int(usage.get("completion_tokens") or 0)
                    choices = chunk.get("choices") or []
                    if not choices:
                        continue
                    delta = choices[0].get("delta") or {}
                    content = delta.get("content")
                    if content:
                        yield content


class OpenRouterProvider(OpenAICompatibleProvider):
    """OpenRouter chat completions (free-tier chain).

    Adds OpenRouter's attribution headers and the full set of statuses OpenRouter
    returns when a free model is exhausted: 402 (no credits on the key), 404
    (model dropped from free tier), 429 (per-day free quota), and 5xx.
    """

    retryable_statuses: frozenset[int] = frozenset({402, 404, 429, 500, 502, 503, 504})

    extra_headers: ClassVar[dict[str, str]] = {
        "HTTP-Referer": "https://veracity.dev",
        "X-Title": "Veracity Assistant",
    }

    name: ClassVar[str] = "openrouter"


# Google Gemini error "status" strings -> HTTP-ish status codes used for
# retry decisions. See https://ai.google.dev/api/rest#error-reporting.
_GEMINI_STATUS_TO_HTTP: dict[str, int] = {
    "RESOURCE_EXHAUSTED": 429,  # free-tier daily/per-minute quota exhausted
    "RATE_LIMIT_EXCEEDED": 429,
    "UNAVAILABLE": 503,
    "INTERNAL": 500,
}


def _append_gemini_content(contents: list[dict], role: str, text: str) -> None:
    """Append a text part to ``contents``, merging with the previous entry when
    the role matches (Gemini rejects consecutive same-role messages)."""
    if not text:
        return
    if contents and contents[-1]["role"] == role:
        contents[-1]["parts"].append({"text": text})
    else:
        contents.append({"role": role, "parts": [{"text": text}]})


def _split_gemini_messages(
    messages: list[dict[str, str]],
) -> tuple[list[dict], dict | None]:
    """Map an OpenAI-style ``messages`` list onto Gemini's request shape.

    Gemini requires the system prompt in a top-level ``system_instruction``
    field (not inside ``contents``) and strictly alternating ``user``/``model``
    roles in ``contents``. Returns ``(contents, system_instruction)`` where
    ``system_instruction`` is None when there is no system message.
    """
    system_parts: list[str] = []
    contents: list[dict] = []

    for msg in messages:
        role = msg.get("role", "")
        content = msg.get("content", "")
        if role == "system":
            system_parts.append(content)
        elif role == "assistant":
            _append_gemini_content(contents, "model", content)
        elif role == "user":
            _append_gemini_content(contents, "user", content)
        else:
            # Unknown role: fall back to user so no message is ever dropped.
            _append_gemini_content(contents, "user", content)

    system_instruction: dict | None = None
    if system_parts:
        system_instruction = {"role": "user", "parts": [{"text": "\n\n".join(system_parts)}]}

    return contents, system_instruction


def _gemini_status_code(err_body: str) -> int:
    """Extract an HTTP-ish status code from a Gemini error response body.

    Returns 0 when the body has no recognizable status (caller falls back to
    the raw HTTP status).
    """
    try:
        error = json.loads(err_body).get("error") or {}
    except json.JSONDecodeError:
        return 0
    code = error.get("code")
    if isinstance(code, int):
        return code
    return _GEMINI_STATUS_TO_HTTP.get(error.get("status", ""), 0)


class GeminiProvider(ChatProvider):
    """Google Gemini (Generative Language API) chat completions.

    Uses Gemini's native REST API (stable, documented) rather than Google's
    beta OpenAI-compat endpoint, so the wire mapping lives in one class:

      * system prompt            -> top-level ``system_instruction``
      * user / assistant roles   -> ``contents`` roles ``user`` / ``model``
      * temperature / max tokens -> ``generationConfig``
      * streaming                -> ``{model}:streamGenerateContent?alt=sse``
    """

    # Statuses that mean "retry on the next model/provider in the chain".
    retryable_statuses: frozenset[int] = frozenset({429, 500, 503})

    name: ClassVar[str] = "gemini"

    async def stream_chat(
        self,
        messages: list[dict[str, str]],
        *,
        model: str,
        temperature: float = 0.0,
        max_tokens: int = 1024,
    ) -> AsyncIterator[str]:
        if not self.api_key:
            raise ProviderError(
                "GEMINI_API_KEY is not set in backend/.env. "
                "Set it (a Google AI Studio API key) before using the gemini provider."
            )

        contents, system_instruction = _split_gemini_messages(messages)
        payload: dict = {
            "contents": contents,
            "generationConfig": {"temperature": temperature, "maxOutputTokens": max_tokens},
        }
        if system_instruction is not None:
            payload["system_instruction"] = system_instruction

        headers = {
            "x-goog-api-key": self.api_key,
            "Content-Type": "application/json",
        }
        url = f"{self.base_url}/models/{model}:streamGenerateContent"

        async with (
            httpx.AsyncClient(timeout=HTTP_TIMEOUT_SECONDS) as client,
            client.stream(
                "POST", url, json=payload, headers=headers, params={"alt": "sse"}
            ) as resp,
        ):
                if resp.status_code != 200:
                    err_body = (await resp.aread()).decode(errors="replace")
                    status = _gemini_status_code(err_body) or resp.status_code
                    logger.error(
                        "gemini_upstream_error",
                        extra={
                            "provider": self.name,
                            "model": model,
                            "status": resp.status_code,
                            "error_body": err_body,
                        },
                    )
                    if status in self.retryable_statuses:
                        raise ModelUnavailable("gemini", model, status, err_body)
                    raise ProviderError(f"Gemini upstream HTTP {resp.status_code}: {err_body}")

                async for line in resp.aiter_lines():
                    line = line.strip()
                    if not line.startswith("data: "):
                        continue
                    try:
                        data = json.loads(line[6:])
                    except json.JSONDecodeError:
                        continue
                    # Gemini sends cumulative token usage on every chunk.
                    usage_meta = data.get("usageMetadata") or {}
                    if usage_meta:
                        usage_stats = current_usage()
                        usage_stats.prompt_tokens = int(usage_meta.get("promptTokenCount") or 0)
                        usage_stats.completion_tokens = int(usage_meta.get("candidatesTokenCount") or 0)
                    for candidate in data.get("candidates") or []:
                        for part in (candidate.get("content") or {}).get("parts") or []:
                            text = part.get("text")
                            if text:
                                yield text


# ---------------------------------------------------------------------------
# Registry & chain construction (the "open for extension" point)
# ---------------------------------------------------------------------------

PROVIDER_REGISTRY: dict[str, type[ChatProvider]] = {
    "openrouter": OpenRouterProvider,
    "gemini": GeminiProvider,
}


def _provider_configs() -> dict[str, dict]:
    """Resolve each known provider's runtime config (read at call time so tests
    can monkeypatch config values)."""
    # Late import keeps config reads at call time so tests can monkeypatch values.
    from config import (
        GEMINI_API_KEY,
        GEMINI_BASE_URL,
        GEMINI_MODELS,
        LLM_MODELS,
        OPENROUTER_API_KEY,
        OPENROUTER_BASE_URL,
    )

    return {
        "openrouter": {
            "api_key": OPENROUTER_API_KEY,
            "base_url": OPENROUTER_BASE_URL,
            "models": list(LLM_MODELS),
        },
        "gemini": {
            "api_key": GEMINI_API_KEY,
            "base_url": GEMINI_BASE_URL,
            "models": list(GEMINI_MODELS),
        },
    }


def get_provider_config(name: str) -> dict:
    """Return the resolved config dict for one provider by name.

    Used by the eval harness (judge) and the chat pipeline (chain building) so
    a provider's api_key/base_url/models are defined in exactly one place.
    """
    name = name.lower()
    configs = _provider_configs()
    try:
        return configs[name]
    except KeyError:
        raise ValueError(
            f"Unknown LLM provider {name!r}. Known providers: {sorted(configs)}"
        ) from None


def get_provider(
    name: str,
    api_key: str = "",
    base_url: str = "",
    models: list[str] | None = None,
) -> ChatProvider:
    """Return a configured provider instance by name (fail fast on unknown names).

    Empty overrides fall back to the provider's config defaults.
    """
    try:
        cls = PROVIDER_REGISTRY[name.lower()]
    except KeyError:
        raise ValueError(
            f"Unknown LLM provider {name!r}. Known providers: {sorted(PROVIDER_REGISTRY)}"
        ) from None
    cfg = get_provider_config(name)
    return cls(
        api_key=api_key or cfg["api_key"],
        base_url=base_url or cfg["base_url"],
        models=models if models is not None else cfg["models"],
    )


def build_provider_chain() -> list[tuple[ChatProvider, str]]:
    """Build the ordered ``[(provider, model), ...]`` fallback chain from config.

    The order is driven by ``LLM_PROVIDERS`` (comma-separated env var). Each
    provider contributes its own model list in order, so the pipeline rotates
    through model A1, A2, ... then provider B1, B2, ... — generalizing the old
    single-provider chain to span multiple providers.

    Config is read at call time (not import time) so tests can monkeypatch it.
    """
    # Late import keeps config reads at call time so tests can monkeypatch values.
    from config import LLM_PROVIDERS

    chain: list[tuple[ChatProvider, str]] = []
    for name in LLM_PROVIDERS:
        provider = get_provider(name)
        for model in provider.models:
            chain.append((provider, model))

    if not chain:
        raise ValueError(
            "LLM_PROVIDERS resolved to an empty model chain. "
            "Check that at least one provider has models configured."
        )
    return chain
