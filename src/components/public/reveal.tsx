"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";

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
 * Elements already in the viewport get revealed instantly (no animation).
 *
 * Re-runs on every route change so new page content gets observed.
 */
export function AutoReveal() {
  const pathname = usePathname();

  useEffect(() => {
    // Small delay to ensure new page DOM is rendered after navigation
    const timer = setTimeout(() => {
      const targets = document.querySelectorAll<HTMLElement>(
        ".reveal:not(.revealed), .reveal-group:not(.revealed)",
      );

      // Immediately reveal anything already in the viewport (no animation)
      targets.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add("revealed");
          el.style.animation = "none";
          el.style.opacity = "1";
          el.style.transform = "none";
          // Also reveal children for reveal-group
          if (el.classList.contains("reveal-group")) {
            el.querySelectorAll<HTMLElement>(":scope > *").forEach((child) => {
              child.style.animation = "none";
              child.style.opacity = "1";
            });
          }
        }
      });

      // Observe remaining (below-fold) elements for scroll reveal
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

      targets.forEach((el) => {
        if (!el.classList.contains("revealed")) {
          observer.observe(el);
        }
      });

      return () => observer.disconnect();
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
