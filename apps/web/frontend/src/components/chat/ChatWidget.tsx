"use client";

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ArrowIcon, ChatIcon, CloseIcon } from "@/components/icons";
import { CHAT_COPY, SUGGESTIONS } from "@/components/chat/chat-data";
import { CTA } from "@/lib/cta";

const Markdown = lazy(() => import("react-markdown"));

type Source = { url?: string; label?: string; title?: string };

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources: Source[];
  pending: boolean;
  failed: boolean;
};

type StreamEvent = {
  type?: string;
  content?: string;
  sources?: Source[];
  message?: string;
};

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `m-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function safeUrl(href: string | undefined): string | undefined {
  if (!href) return undefined;
  if (href.startsWith("/")) return href;
  try {
    const url = new URL(href);
    if (url.protocol === "http:" || url.protocol === "https:") return href;
  } catch {
    return undefined;
  }
  return undefined;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);

  const sessionIdRef = useRef<string | null>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => textareaRef.current?.focus(), 60);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const close = () => {
    setOpen(false);
    launcherRef.current?.focus();
  };

  const setAssistant = (id: string, patch: Partial<Message>) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
    );
  };

  const appendToken = (id: string, token: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, content: m.content + token, pending: false } : m))
    );
  };

  async function send(rawQuestion: string) {
    const question = rawQuestion.trim();
    if (!question || streaming) return;

    if (!sessionIdRef.current) sessionIdRef.current = createId();

    const userMessage: Message = {
      id: createId(),
      role: "user",
      content: question,
      sources: [],
      pending: false,
      failed: false,
    };
    const assistantId = createId();
    const assistantMessage: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      sources: [],
      pending: true,
      failed: false,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");
    setStreaming(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: question,
          session_id: sessionIdRef.current,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`http_${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finished = false;

      while (!finished) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;

          let event: StreamEvent;
          try {
            event = JSON.parse(raw) as StreamEvent;
          } catch {
            continue;
          }

          if (event.type === "token" && typeof event.content === "string") {
            appendToken(assistantId, event.content);
          } else if (event.type === "citations" && Array.isArray(event.sources)) {
            const sources = event.sources.filter(
              (s): s is Source => typeof s === "object" && s !== null
            );
            setAssistant(assistantId, { sources });
          } else if (event.type === "done") {
            finished = true;
          } else if (event.type === "error") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      pending: false,
                      failed: true,
                      content: m.content || event.message || CHAT_COPY.error,
                    }
                  : m
              )
            );
            finished = true;
          }
        }
      }

      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, pending: false } : m))
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, pending: false, failed: true, content: CHAT_COPY.error }
            : m
        )
      );
    } finally {
      setStreaming(false);
    }
  }

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="veracity-chat"
        aria-label={open ? CHAT_COPY.closeLabel : CHAT_COPY.openLabel}
        className="fixed bottom-5 right-5 z-chat inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-[0_10px_28px_-10px_rgba(13,60,45,0.55)] transition-colors duration-200 hover:bg-primary-deep sm:bottom-6 sm:right-6"
      >
        {open ? (
          <CloseIcon className="h-5 w-5" />
        ) : (
          <ChatIcon className="h-5 w-5" />
        )}
      </button>

      {open && (
        <section
          id="veracity-chat"
          role="dialog"
          aria-modal="false"
          aria-labelledby="veracity-chat-title"
          className="v-chat-in fixed bottom-20 right-5 z-chat flex h-[min(70vh,36rem)] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-line bg-bg text-ink shadow-[0_18px_50px_-20px_rgba(8,28,21,0.4)] sm:bottom-24 sm:right-6"
        >
          <header className="flex items-start justify-between gap-3 border-b border-on-dark-line bg-primary-deep px-4 py-3">
            <div>
              <h2
                id="veracity-chat-title"
                className="font-display text-base font-semibold tracking-tight text-on-dark"
              >
                {CHAT_COPY.title}
              </h2>
              <p className="mt-0.5 text-[0.6875rem] text-on-dark-muted">
                {CHAT_COPY.subtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label={CHAT_COPY.closeLabel}
              className="rounded-full p-1.5 text-on-dark-muted transition-colors hover:bg-white/10 hover:text-on-dark"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </header>

          <div
            ref={listRef}
            className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4"
          >
            {messages.length === 0 ? (
              <div className="flex h-full flex-col justify-center gap-4">
                <p className="text-sm text-muted">{CHAT_COPY.greeting}</p>
                <ul className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((suggestion) => (
                    <li key={suggestion.prompt}>
                      <button
                        type="button"
                        onClick={() => void send(suggestion.prompt)}
                        className="rounded-full border border-line px-3 py-1.5 text-[0.8125rem] text-muted transition-colors hover:border-primary hover:text-primary"
                      >
                        {suggestion.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              messages.map((message) =>
                message.role === "user" ? (
                  <div key={message.id} className="flex justify-end">
                    <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-white">
                      {message.content}
                    </p>
                  </div>
                ) : (
                  <div key={message.id} className="flex justify-start">
                    <div className="max-w-[92%] rounded-2xl rounded-bl-sm bg-surface px-4 py-2.5 text-sm">
                      {message.content ? (
                        <Suspense
                          fallback={
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          }
                        >
                          <Markdown
                            components={{
                              a: ({ href, children }) => {
                                const url = safeUrl(href);
                                if (!url) return <span>{children}</span>;
                                return (
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary-deep"
                                  >
                                    {children}
                                  </a>
                                );
                              },
                              p: ({ children }) => (
                                <p className="mb-2 last:mb-0">{children}</p>
                              ),
                              h3: ({ children }) => (
                                <p className="mb-1 mt-2 font-semibold text-ink first:mt-0">
                                  {children}
                                </p>
                              ),
                              ul: ({ children }) => (
                                <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">
                                  {children}
                                </ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">
                                  {children}
                                </ol>
                              ),
                              li: ({ children }) => <li>{children}</li>,
                              strong: ({ children }) => (
                                <strong className="font-semibold text-ink">
                                  {children}
                                </strong>
                              ),
                            }}
                          >
                            {message.content}
                          </Markdown>
                        </Suspense>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1"
                          aria-hidden="true"
                        >
                          <span className="v-chat-dot h-1.5 w-1.5 rounded-full bg-muted" />
                          <span
                            className="v-chat-dot h-1.5 w-1.5 rounded-full bg-muted"
                            style={{ animationDelay: "160ms" }}
                          />
                          <span
                            className="v-chat-dot h-1.5 w-1.5 rounded-full bg-muted"
                            style={{ animationDelay: "320ms" }}
                          />
                        </span>
                      )}

                      {message.sources.length > 0 && (
                        <div className="mt-2 border-t border-line pt-2">
                          <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted">
                            {CHAT_COPY.sourcesLabel}
                          </p>
                          <ul className="mt-1 space-y-0.5">
                            {message.sources.map((source, index) => {
                              const label =
                                source.label ||
                                source.title ||
                                source.url ||
                                `${CHAT_COPY.sourcesLabel} ${index + 1}`;
                              const url = safeUrl(source.url);
                              return (
                                <li key={`${source.url ?? "s"}-${index}`}>
                                  {url ? (
                                    <a
                                      href={url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-xs text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary-deep"
                                    >
                                      {label}
                                    </a>
                                  ) : (
                                    <span className="text-xs text-muted">
                                      {label}
                                    </span>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )
              )
            )}
          </div>

          <footer className="border-t border-line p-3">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void send(input);
              }}
              className="flex items-end gap-2"
            >
              <label htmlFor="veracity-chat-input" className="sr-only">
                {CHAT_COPY.placeholder}
              </label>
              <textarea
                id="veracity-chat-input"
                ref={textareaRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void send(input);
                  }
                }}
                rows={1}
                disabled={streaming}
                placeholder={CHAT_COPY.placeholder}
                className="max-h-32 min-h-[2.5rem] flex-1 resize-none rounded-xl border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-soft disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!input.trim() || streaming}
                aria-label={CHAT_COPY.sendLabel}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-deep disabled:opacity-40 disabled:hover:bg-primary"
              >
                <ArrowIcon className="h-4 w-4 -rotate-45" />
              </button>
            </form>
            <p className="mt-2 text-[0.6875rem] text-muted">
              {CHAT_COPY.footnote}{" "}
              <a
                href={CTA.contact}
                className="text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary-deep"
              >
                {CHAT_COPY.contactLinkLabel}
              </a>
            </p>
          </footer>
        </section>
      )}

      <p aria-live="polite" className="sr-only">
        {open && streaming ? CHAT_COPY.typing : ""}
      </p>
    </>
  );
}
