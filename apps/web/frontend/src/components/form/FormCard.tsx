import type { ReactNode } from "react";

export function FormCard({
  eyebrow,
  note,
  id,
  className = "",
  children,
}: {
  eyebrow: string;
  note: string;
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div id={id} className={`scroll-mt-24 overflow-hidden rounded-2xl border border-line bg-surface ${className}`}>
      <div className="flex items-center justify-between bg-primary-deep px-5 py-3.5">
        <p className="text-xs font-bold tracking-[0.16em] text-on-dark">{eyebrow}</p>
        <p className="text-xs font-semibold text-on-dark-muted">{note}</p>
      </div>
      {children}
    </div>
  );
}
