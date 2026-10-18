"use client";

import { useEffect, useState } from "react";
import { cx } from "./ui";

/**
 * Animated headline stack: the active word is full Rewind, the rest sit at 40% white in the same column.
 * The full list is always in the DOM (screen readers read it once); motion stops under prefers-reduced-motion.
 */
export function HeadlineCycle({ words, label, id, interval = 2400 }: { words: string[]; label: string; id?: string; interval?: number }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setActive((i) => (i + 1) % words.length), interval);
    return () => clearInterval(t);
  }, [words.length, interval]);

  return (
    <h2 id={id} className="display-type text-[48px] leading-[0.98] sm:text-[67px]">
      <span className="sr-only">{label}</span>
      {words.map((w, i) => (
        <span
          key={w}
          aria-hidden
          className={cx("block transition-colors duration-500", i === active ? "text-field" : "text-paper/40")}
        >
          {w}
        </span>
      ))}
    </h2>
  );
}
