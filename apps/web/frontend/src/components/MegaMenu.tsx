"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { ArrowIcon, ChevronIcon } from "@/components/icons";
import type { MegaColumn, NavItem, NavLink } from "@/lib/site";

const CLOSE_DELAY = 180;

function splitLinks(links: NavLink[]): NavLink[][] {
  if (links.length <= 3) return links.map((link) => [link]);
  const size = Math.ceil(links.length / 3);
  const chunks: NavLink[][] = [];
  for (let i = 0; i < links.length; i += size) chunks.push(links.slice(i, i + size));
  return chunks;
}

export function MegaMenu({ items, scrolled }: { items: NavItem[]; scrolled: boolean }) {
  const [open, setOpen] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const close = useCallback(() => {
    clearCloseTimer();
    setOpen(null);
  }, []);

  const openItem = (id: string) => {
    clearCloseTimer();
    setOpen(id);
  };

  const scheduleClose = (id: string) => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => {
      setOpen((current) => (current === id ? null : current));
    }, CLOSE_DELAY);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key !== "Escape" || !open) return;
    close();
    navRef.current
      ?.querySelector<HTMLButtonElement>(`[data-trigger-for="${open}"]`)
      ?.focus();
  };

  return (
    <nav
      ref={navRef}
      aria-label="Primary"
      onKeyDown={onKeyDown}
      className="relative hidden items-center gap-1 lg:flex"
    >
      {items.map((item) => {
        const id = item.label.toLowerCase().replace(/\s+/g, "-");
        const isOpen = open === id;
        const single = item.mega ? item.mega.columns.length === 1 : false;
        const columns: MegaColumn[] =
          single && item.mega
            ? splitLinks(item.mega.columns[0].links).map((links) => ({ links }))
            : (item.mega?.columns ?? []);
        return (
          <div
            key={item.href}
            className="relative"
            onMouseEnter={() => openItem(id)}
            onMouseLeave={() => scheduleClose(id)}
            onFocus={() => openItem(id)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) close();
            }}
          >
            <div className="flex items-center">
              <Link
                href={item.href}
                className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                  scrolled
                    ? isOpen
                      ? "text-ink"
                      : "text-muted hover:text-ink"
                    : isOpen
                      ? "text-hero-ink"
                      : "text-hero-muted hover:text-hero-ink"
                }`}
              >
                {item.label}
              </Link>
              {item.mega && (
                <button
                  type="button"
                  data-trigger-for={id}
                  aria-expanded={isOpen}
                  aria-controls={`mega-${id}`}
                  aria-label={`${isOpen ? "Close" : "Open"} ${item.label} menu`}
                  onClick={() => (isOpen ? close() : openItem(id))}
                  onMouseEnter={() => openItem(id)}
                  className={`-ml-1 mr-2 rounded-full p-1.5 transition-colors ${
                    scrolled
                      ? "text-muted hover:text-ink"
                      : "text-hero-muted hover:text-hero-ink"
                  }`}
                >
                  <ChevronIcon
                    className={`size-3.5 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              )}
            </div>
            {item.mega && (
              <div
                id={`mega-${id}`}
                className={`absolute left-1/2 top-full w-[min(46rem,calc(100vw-2.5rem))] -translate-x-1/2 pt-1 ${
                  isOpen ? "visible" : "invisible"
                }`}
              >
                <div
                  className={`overflow-hidden rounded-2xl border border-line bg-bg p-6 shadow-[0_20px_25px_-5px_rgb(27_67_50_/_0.10),0_8px_10px_-6px_rgb(27_67_50_/_0.10)] transition-[opacity,transform] duration-200 ease-out sm:p-8 ${
                    isOpen ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
                  }`}
                >
                  <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {columns.map((column, i) => (
                      <div key={column.heading ?? i}>
                        {column.heading && (
                          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-widest text-muted">
                            {column.heading}
                          </p>
                        )}
                        <ul className="space-y-0.5">
                          {column.links.map((link) => (
                            <li key={`${link.href} ${link.label}`}>
                              <Link
                                href={link.href}
                                onClick={close}
                                className="block rounded-lg px-2 py-1.5 text-sm text-ink transition-colors hover:bg-surface hover:text-primary"
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  {item.mega.cta && (
                    <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
                      <Link
                        href={item.mega.cta.href}
                        onClick={close}
                        className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-deep"
                      >
                        {item.mega.cta.label}
                        <ArrowIcon className="size-4" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
