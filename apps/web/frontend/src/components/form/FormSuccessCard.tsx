import type { ReactNode } from "react";
import { CheckIcon } from "@/components/icons";

export function FormSuccessCard({
  eyebrow,
  note,
  heading,
  fallbackEmail,
  children,
}: {
  eyebrow: string;
  note: string;
  heading: string;
  fallbackEmail: string;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="flex items-center justify-between bg-primary-deep px-5 py-3.5">
        <p className="text-xs font-bold tracking-[0.16em] text-on-dark">{eyebrow}</p>
        <p className="text-xs font-semibold text-on-dark-muted">{note}</p>
      </div>
      <div className="flex flex-col items-center px-5 py-14 text-center sm:px-8" role="status" aria-live="polite">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary">
          <CheckIcon className="size-5" />
        </span>
        <h2 className="mt-6 font-display text-2xl font-semibold">{heading}</h2>
        <div className="mt-3 max-w-md text-[0.9375rem] leading-relaxed text-muted">{children}</div>
        <p className="mt-8 text-[0.9375rem] font-medium text-muted">
          Prefer to write directly?{" "}
          <a
            href={`mailto:${fallbackEmail}`}
            className="font-semibold text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary"
          >
            {fallbackEmail}
          </a>
        </p>
      </div>
    </div>
  );
}
