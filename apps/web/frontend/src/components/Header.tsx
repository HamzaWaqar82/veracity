"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MegaMenu } from "@/components/MegaMenu";
import type { NavItem } from "@/lib/site";

export function Header({ nav }: { nav: NavItem[] }) {
  const [scrolled, setScrolled] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrolled(window.scrollY > 16));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
          scrolled ? "border-line bg-bg/95" : "border-transparent bg-transparent"
        }`}
      >
        <div className="container-x flex h-16 items-center justify-between sm:h-[4.5rem]">
          <Link
            href="/"
            className={`font-display text-xl font-semibold tracking-tight transition-colors ${
              scrolled ? "text-ink" : "text-hero-ink"
            }`}
          >
            Veracity
          </Link>
          <MegaMenu items={nav} scrolled={scrolled} />
          <div className="flex items-center gap-3">
            <Link
              href="/early-access"
              className={`btn btn-lg hidden md:inline-flex ${scrolled ? "btn-primary" : "btn-white"}`}
            >
              Get Early Access
            </Link>
            <button
              type="button"
              onClick={open}
              aria-haspopup="dialog"
              aria-label="Open menu"
              className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold lg:hidden ${
                scrolled ? "border-line text-ink" : "border-hero-line text-hero-ink"
              }`}
            >
              Menu
            </button>
          </div>
        </div>
      </header>

      <dialog
        ref={dialogRef}
        aria-label="Menu"
        className="m-0 h-full w-full max-w-none bg-bg p-0 text-ink backdrop:bg-primary-deep/40"
      >
        <div className="flex h-full flex-col">
          <div className="container-x flex h-16 shrink-0 items-center justify-between sm:h-[4.5rem]">
            <Link
              href="/"
              onClick={close}
              className="font-display text-xl font-semibold tracking-tight"
            >
              Veracity
            </Link>
            <button
              type="button"
              onClick={close}
              autoFocus
              className="rounded-full border border-line px-4 py-2 text-sm font-semibold"
            >
              Close
            </button>
          </div>
          <nav className="container-x flex flex-1 flex-col overflow-y-auto pb-12" aria-label="Mobile">
            {nav.map((item) =>
              item.mega ? (
                <div key={item.href} className="border-b border-line py-5">
                  <Link
                    href={item.href}
                    onClick={close}
                    className="font-display text-3xl font-medium text-ink transition-colors hover:text-primary sm:text-4xl"
                  >
                    {item.label}
                  </Link>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {item.mega.columns.map((column, i) => (
                      <div key={column.heading ?? i}>
                        {column.heading && (
                          <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-muted">
                            {column.heading}
                          </p>
                        )}
                        <ul>
                          {column.links.map((link) => (
                            <li key={`${link.href} ${link.label}`}>
                              <Link
                                href={link.href}
                                onClick={close}
                                className="block py-1 text-sm text-muted transition-colors hover:text-ink"
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
                    <Link
                      href={item.mega.cta.href}
                      onClick={close}
                      className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary"
                    >
                      {item.mega.cta.label}
                    </Link>
                  )}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className="border-b border-line py-5 font-display text-3xl font-medium text-ink transition-colors hover:text-primary sm:text-4xl"
                >
                  {item.label}
                </Link>
              ),
            )}
            <div className="mt-10">
              <Link href="/early-access" onClick={close} className="btn btn-lg btn-primary w-full">
                Get Early Access
              </Link>
              <p className="mt-3 text-center text-sm text-muted">Early access · 14-day free trial</p>
            </div>
          </nav>
        </div>
      </dialog>
    </>
  );
}
