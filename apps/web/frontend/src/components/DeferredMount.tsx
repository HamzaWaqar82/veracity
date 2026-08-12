"use client";

import { useEffect, useState, type ReactNode } from "react";

type DeferredMountProps = {
  children: ReactNode;
  fallback?: ReactNode;
  delay?: number;
};

export function DeferredMount({ children, fallback = null, delay = 1500 }: DeferredMountProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const done = () => setMounted(true);
    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(done, { timeout: delay });
      return () => cancelIdleCallback(id);
    }
    const timeout = window.setTimeout(done, delay);
    return () => window.clearTimeout(timeout);
  }, [delay]);

  return <>{mounted ? children : fallback}</>;
}
