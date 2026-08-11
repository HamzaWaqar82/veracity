"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CloseIcon } from "@/components/icons";
import type { FaqCategory } from "@/lib/faq";

type SearchItem = {
  id: string;
  question: string;
  answerText: string;
  category: string;
};

export function FaqSearch({ categories }: { categories: FaqCategory[] }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const allItems = useMemo<SearchItem[]>(
    () =>
      categories.flatMap((category) =>
        category.qas.map((qa) => ({
          id: qa.id,
          question: qa.question,
          answerText: qa.answerText,
          category: category.title,
        })),
      ),
    [categories],
  );

  const searching = query.trim().length > 0;
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allItems
      .filter((item) => `${item.question} ${item.answerText}`.toLowerCase().includes(q))
      .slice(0, 12);
  }, [query, allItems]);

  useEffect(() => {
    const openFromHash = () => {
      const hash = window.location.hash;
      if (!hash) return;
      const el = document.getElementById(hash.slice(1));
      if (!el) return;
      if (el.tagName.toLowerCase() === "details") {
        (el as HTMLDetailsElement).open = true;
      }
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

  const goTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.tagName.toLowerCase() === "details") {
      (el as HTMLDetailsElement).open = true;
    }
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="mx-auto mb-20 w-full max-w-2xl">
      <div role="search" aria-label="Search frequently asked questions">
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && results.length > 0) {
                goTo(results[0].id);
              }
              if (event.key === "Escape") {
                setQuery("");
                inputRef.current?.blur();
              }
            }}
            aria-label="Search frequently asked questions"
            placeholder="Search 37 questions…"
            className="w-full rounded-2xl border border-line bg-white py-4 pl-12 pr-12 text-[1rem] text-ink shadow-sm outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {searching && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted transition-colors hover:bg-primary-soft hover:text-primary"
            >
              <CloseIcon className="size-4" />
            </button>
          )}
        </div>
        <p className="sr-only" aria-live="polite">
          {searching ? `${results.length} result${results.length === 1 ? "" : "s"}` : ""}
        </p>
      </div>

      {searching && (
        <div className="mt-2 overflow-hidden rounded-2xl border border-line bg-white shadow-lg">
          {results.length > 0 ? (
            <ul>
              {results.map((item) => (
                <li key={item.id} className="border-b border-line last:border-b-0">
                  <button
                    type="button"
                    onClick={() => goTo(item.id)}
                    className="w-full px-5 py-4 text-left transition-colors hover:bg-mint/40"
                  >
                    <span className="block text-[0.9375rem] font-semibold text-ink">
                      {item.question}
                    </span>
                    <span className="mt-0.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                      {item.category}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-5 py-8 text-center">
              <p className="text-sm font-medium text-muted">
                No matches for “{query.trim()}”.
              </p>
              <a
                href="mailto:support@veracity.dev?subject=Veracity%20question"
                className="mt-2 inline-block text-sm font-semibold text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
              >
                Ask us directly
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
