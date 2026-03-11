"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Lightweight scroll-reveal wrapper using IntersectionObserver.
 * Adds `.revealed` class when element enters viewport.
 */
export function Reveal({
  children,
  className = "",
  group = false,
}: {
  children: ReactNode;
  className?: string;
  group?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("revealed");
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${group ? "reveal-group" : "reveal"} ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Drop this once in a layout. It auto-observes any element with
 * class `.reveal` or `.reveal-group` and adds `.revealed` on scroll.
 */
export function AutoReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1 },
    );

    const targets = document.querySelectorAll(".reveal, .reveal-group");
    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return null;
}
