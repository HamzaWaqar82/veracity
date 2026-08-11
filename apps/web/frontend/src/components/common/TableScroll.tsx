"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Shared horizontal-scroll affordance for wide tables.
 * Adds a left/right edge fade while the content overflows and a
 * "scroll for more" hint on touch/tablet widths.
 */
export function TableScroll({
  children,
  hint = "Scroll sideways for more",
  className = "",
}: {
  children: ReactNode;
  hint?: string | false;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setOverflows(el.scrollWidth > el.clientWidth + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div>
      <div ref={ref} className={`overflow-x-auto ${overflows ? "scroll-fade-x" : ""} ${className}`}>
        {children}
      </div>
      {hint !== false && overflows && (
        <p className="mt-3 text-center text-sm font-medium text-muted lg:hidden">{hint}</p>
      )}
    </div>
  );
}
