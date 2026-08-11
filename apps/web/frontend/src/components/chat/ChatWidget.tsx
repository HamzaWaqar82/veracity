"use client";

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowIcon, ChatIcon, CloseIcon } from "@/components/icons";
import { CHAT_COPY, SUGGESTIONS } from "@/components/chat/chat-data";
import { CTA } from "@/lib/cta";

const Markdown = lazy(() => import("react-markdown"));

const STORAGE_KEY = "veracity-chat-v1";

type Source = { url?: string; label?: string; title?: string };

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources: Source[];
  pending: boolean;
  failed: boolean;
  streaming: boolean;
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
    if (url.protocol === "http:" || url.protocol === "https:") return url.toString();
  } catch {
    return undefined;
  }
  return undefined;
}

function plainText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`/g, "")
    .replace(/\*\*|__|\*|_|~~|#/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, (_match, label: string) => label)
    .replace(/!\[/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function loadChat(): { messages: Message[]; sessionId: string | null } {
  if (typeof window === "undefined") return { messages: [], sessionId: null };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { messages: [], sessionId: null };
    const parsed = JSON.parse(raw) as {
      v?: number;
      sessionId?: string | null;
      messages?: Message[];
    };
    const messages = (parsed.messages ?? []).filter((m) => !m.pending && !m.streaming);
    return { messages, sessionId: parsed.sessionId ?? null };
  } catch {
    return { messages: [], sessionId: null };
  }
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [announce, setAnnounce] = useState("");

  const dialogRef = useRef<HTMLDialogElement>(null);
  const sessionIdRef = useRef<string | null>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const nearBottomRef = useRef(true);

  useEffect(() => {
    const saved = loadChat();
    if (saved.messages.length > 0) setMessages(saved.messages);
    if (saved.sessionId) sessionIdRef.current = saved.sessionId;
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;
    try {
      const payload = JSON.stringify({
        v: 1,
        sessionId: sessionIdRef.current,
        messages: messages.map((m) => ({ ...m, pending: false })),
      });
      window.localStorage.setItem(STORAGE_KEY, payload);
    } catch {
      // storage unavailable - session just won't survive a reload
    }
  }, [messages]);

  const scrollToBottom = () => {
    const el = listRef.current;
    if (el && nearBottomRef.current) el.scrollTop = el.scrollHeight;
  };

  const handleListScroll = () => {
    const el = listRef.current;
    if (!el) return;
    nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 96;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (open) scrollToBottom();
  }, [open]);

  const openChat = () => {
    setOpen(true);
    dialogRef.current?.showModal();
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const close = () => {
    try {
      dialogRef.current?.close();
    } catch {
      // ignore - dialog may already be closed
    }
    setOpen(false);
  };

  const toggle = () => {
    const dlg = dialogRef.current;
    if (dlg?.open) {
      dlg.close();
      setOpen(false);
    } else {
      openChat();
    }
  };

  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      close();
    }
  }, [pathname]);

  const clearConversation = () => {
    sessionIdRef.current = null;
    setMessages([]);
    setAnnounce("");
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // storage unavailable
    }
  };

  const setAssistant = (id: string, patch: Partial<Message>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const appendToken = (id: string, token: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, content: m.content + token, pending: false, streaming: true }
          : m
      )
    );
  };

  async function send(rawQuestion: string, retryAssistantId?: string) {
    const question = rawQuestion.trim();
    if (!question || streaming) return;

    if (!sessionIdRef.current) sessionIdRef.current = createId();

    if (retryAssistantId) {
      setMessages((prev) => prev.filter((m) => m.id !== retryAssistantId));
    }

    const userMessage: Message = {
      id: createId(),
      role: "user",
      content: question,
      sources: [],
      pending: false,
      failed: false,
      streaming: false,
    };
    const assistantId = createId();
    const assistantMessage: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      sources: [],
      pending: true,
      failed: false,
      streaming: false,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");
    setStreaming(true);
    setAnnounce(CHAT_COPY.typing);

    let answerContent = "";

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
            answerContent += event.content;
            appendToken(assistantId, event.content);
          } else if (event.type === "citations" && Array.isArray(event.sources)) {
            const sources = event.sources.filter(
              (s): s is Source => typeof s === "object" && s !== null
            );
            setAssistant(assistantId, { sources });
          } else if (event.type === "done") {
            finished = true;
          } else if (event.type === "error") {
            if (event.message) console.error("chat error:", event.message);
            answerContent = CHAT_COPY.error;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      pending: false,
                      failed: true,
                      streaming: false,
                      content: m.content || CHAT_COPY.error,
                    }
                  : m
              )
            );
            finished = true;
          }
        }
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, pending: false, streaming: false } : m
        )
      );
      if (answerContent) {
        setAnnounce(`${CHAT_COPY.replyPrefix} ${plainText(answerContent)}`);
      }
    } catch {
      answerContent = CHAT_COPY.error;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, pending: false, failed: true, streaming: false, content: CHAT_COPY.error }
            : m
        )
      );
      setAnnounce(`${CHAT_COPY.replyPrefix} ${plainText(answerContent)}`);
    } finally {
      setStreaming(false);
    }
  }

  const retry = (assistantId: string) => {
    const idx = messages.findIndex((m) => m.id === assistantId);
    if (idx < 0) return;
    let prompt = "";
    for (let i = idx - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        prompt = messages[i].content;
        break;
      }
    }
    if (!prompt) return;
    void send(prompt, assistantId);
  };

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        onClick={toggle}
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

      <dialog
        ref={dialogRef}
        id="veracity-chat"
        aria-labelledby="veracity-chat-title"
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="fixed bottom-20 right-5 top-auto left-auto z-chat m-0 flex h-[min(70vh,36rem)] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-line bg-bg p-0 text-ink shadow-[0_18px_50px_-20px_rgba(8,28,21,0.4)] backdrop:bg-ink/20 sm:bottom-24 sm:right-6 [&:not([open])]:hidden"
      >
        <header className="flex items-start justify-between gap-3 border-b border-on-dark-line bg-primary-deep px-4 py-3">
          <div>
            <h2
              id="veracity-chat-title"
              className="font-display text-base font-semibold tracking-tight text-on-dark"
            >
              {CHAT_COPY.title}
            </h2>
            <p className="mt-0.5 text-[0.8125rem] text-on-dark-muted">
              {CHAT_COPY.subtitle}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={clearConversation}
              aria-label={CHAT_COPY.clearLabel}
              className="rounded-full px-2 py-1 text-[0.8125rem] font-semibold text-on-dark-muted transition-colors hover:bg-white/10 hover:text-on-dark"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={close}
              aria-label={CHAT_COPY.closeLabel}
              className="rounded-full p-1.5 text-on-dark-muted transition-colors hover:bg-white/10 hover:text-on-dark"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div
          ref={listRef}
          onScroll={handleListScroll}
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
                      <span className="inline-flex items-center gap-1" aria-hidden="true">
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

                    {!message.pending && message.sources.length > 0 && (
                      <div className="mt-2 border-t border-line pt-2">
                        <p className="text-[0.8125rem] font-semibold uppercase tracking-wider text-muted">
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

                    {message.failed && (
                      <button
                        type="button"
                        onClick={() => retry(message.id)}
                        className="mt-2.5 rounded-full border border-line px-3 py-1 text-xs font-semibold text-ink transition-colors hover:border-primary hover:text-primary"
                      >
                        {CHAT_COPY.retryLabel}
                      </button>
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
              placeholder={CHAT_COPY.placeholder}
              className="max-h-32 min-h-[2.5rem] flex-1 resize-none rounded-xl border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-soft"
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
          <p className="mt-2 text-[0.8125rem] text-muted">
            {CHAT_COPY.footnote}{" "}
            <a
              href={CTA.contact}
              className="text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary-deep"
            >
              {CHAT_COPY.contactLinkLabel}
            </a>
          </p>
        </footer>
      </dialog>

      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
    </>
  );
}
