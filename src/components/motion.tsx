"use client";

import { createElement, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Reveal children one after another when the group scrolls into view (CSS in globals: [data-reveal]).
 * Content stays visible if this never runs: only off-screen groups are marked "pending" first.
 * Children get --i for the stagger; the total delay stays short.
 */
export function Reveal({ as = "div", className, children }: { as?: "div" | "ul" | "ol"; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return; // already on screen: leave it be
    [...el.children].forEach((c, i) => (c as HTMLElement).style.setProperty("--i", String(Math.min(i, 5))));
    el.dataset.reveal = "pending";
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.dataset.reveal = "shown";
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return createElement(as, { ref, className }, children);
}

/** The hero's example hold, actually counting down (it is an illustration, labelled as such). */
export function CountdownChip({ start = 5 * 3600 + 59 * 60 + 41 }: { start?: number }) {
  const [left, setLeft] = useState(start);
  useEffect(() => {
    const t = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : start)), 1000);
    return () => clearInterval(t);
  }, [start]);
  const h = Math.floor(left / 3600);
  const m = String(Math.floor((left % 3600) / 60)).padStart(2, "0");
  const s = String(left % 60).padStart(2, "0");
  return (
    <span className="font-mono tabular" aria-hidden>
      {h}:{m}:{s}
    </span>
  );
}
