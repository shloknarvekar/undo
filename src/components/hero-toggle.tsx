"use client";

import { useState } from "react";
import { cx } from "./ui";

const COPY = {
  shoppers: "Your AI agent shops for you. If it gets it wrong, one tap puts the money back — checked against what you actually signed.",
  merchants: "Agent orders are arriving now. Undo tells you who's at fault, voids before capture, and makes the agent's operator pay you back for its mistakes.",
};

/** The reference's centered toggle pill, made functional: switches the hero promise per audience. */
export function HeroToggle({ onDeep = false }: { onDeep?: boolean }) {
  const [who, setWho] = useState<keyof typeof COPY>("shoppers");
  return (
    <div className="flex flex-col items-center gap-8">
      <div role="group" aria-label="Show the promise for" className={cx("inline-flex rounded-full border p-1", onDeep ? "border-paper/40" : "border-ink")}>
        {(["shoppers", "merchants"] as const).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={who === k}
            aria-controls="hero-promise"
            onClick={() => setWho(k)}
            className={cx(
              "min-h-11 rounded-full px-6 text-body font-medium capitalize transition-colors duration-200 cursor-pointer",
              onDeep
                ? who === k ? "bg-field text-deep" : "text-paper hover:bg-paper/10"
                : who === k ? "bg-ink text-paper" : "text-ink hover:bg-ink/10",
            )}
          >
            {k}
          </button>
        ))}
      </div>
      <p id="hero-promise" aria-live="polite" className={cx("max-w-[640px] text-center text-subheading sm:text-heading-sm sm:leading-snug", onDeep ? "text-paper/80" : "text-ink/80")}>
        {COPY[who]}
      </p>
    </div>
  );
}
