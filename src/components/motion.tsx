"use client";

import { Pause, Play } from "lucide-react";
import { createElement, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Boxes } from "./ui/background-boxes";

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

/**
 * Hero grid. The interactive version is ~3,000 hover cells, so it is built after the hero has painted,
 * and only where a fine pointer can hover. Touch screens get the same grid drawn in CSS (one element).
 */
const BOX_TRANSFORM = "translate(-40%,-60%) skewX(-48deg) skewY(14deg) scale(0.675) rotate(0deg) translateZ(0)";

export function HeroGrid({ colors, lineColor, className }: { colors: string[]; lineColor: string; className?: string }) {
  const [mode, setMode] = useState<"pending" | "interactive" | "static">("pending");
  // Very wide screens need a bigger grid to fill the slash; everyone else keeps the lighter one.
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const pick = () => {
      setWide(window.innerWidth > 2000);
      setMode(mq.matches ? "interactive" : "static");
    };
    const idle = window.requestIdleCallback ? window.requestIdleCallback(pick, { timeout: 800 }) : window.setTimeout(pick, 200);
    mq.addEventListener("change", pick);
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      mq.removeEventListener("change", pick);
    };
  }, []);

  if (mode === "interactive")
    return <Boxes rows={wide ? 96 : 64} cols={wide ? 64 : 48} colors={colors} lineClassName="border-paper/[0.16] text-paper/25" className={className} />;
  if (mode === "pending") return null;
  return (
    <div aria-hidden className={cn("absolute -top-1/4 left-1/4 z-0 h-full w-full p-4", className)} style={{ transform: BOX_TRANSFORM }}>
      <div
        className="h-[1536px] w-[4096px]"
        style={{
          backgroundImage: `linear-gradient(to right, ${lineColor} 1px, transparent 1px), linear-gradient(to bottom, ${lineColor} 1px, transparent 1px)`,
          backgroundSize: "64px 32px",
        }}
      />
    </div>
  );
}

/**
 * The CTRL+Z band: two copies of the word run right to left on a loop. Anything that moves on its own for
 * more than five seconds needs a way to stop it (WCAG 2.2.2), so the band carries a pause control.
 */
export function CtrlZBand() {
  const [paused, setPaused] = useState(false);
  return (
    <section aria-label="Ctrl+Z for money" className="section-flow relative overflow-hidden bg-deep">
      <div aria-hidden className={`marquee flex w-max select-none py-4 ${paused ? "[animation-play-state:paused]" : ""}`}>
        {[0, 1].map((copy) => (
          <p key={copy} className="display-type flex shrink-0 items-center whitespace-nowrap text-[31vw] leading-[0.8] text-field">
            {[0, 1].map((k) => (
              <span key={k} className="flex items-center">
                CTRL+Z<span className="mx-[6vw] inline-block size-[5vw] rounded-full bg-field" />
              </span>
            ))}
          </p>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        className="on-deep motion-reduce:hidden absolute bottom-3 right-4 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-deep/80 px-4 text-body-sm font-medium text-paper ring-1 ring-paper/30 transition-colors hover:bg-paper hover:text-deep"
      >
        {paused ? <Play className="size-4" aria-hidden /> : <Pause className="size-4" aria-hidden />}
        {paused ? "Play" : "Pause"}
        <span className="sr-only"> the moving Ctrl+Z band</span>
      </button>
    </section>
  );
}
