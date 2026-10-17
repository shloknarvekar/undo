"use client";

import { useState } from "react";
import { cx } from "./ui";

const COPY = {
  shoppers: "Your AI agent shops for you. If it gets it wrong, one tap puts the money back — checked against what you actually signed.",
  merchants: "Agent orders are arriving now. Undo tells you who's at fault, voids before capture, and shifts agent mistakes to the agent.",
};

/** The reference's centered toggle pill, made functional: switches the hero promise per audience. */
export function HeroToggle() {
  const [who, setWho] = useState<keyof typeof COPY>("shoppers");
  return (
    <div className="flex flex-col items-center gap-8">
      <div role="tablist" aria-label="Audience" className="inline-flex rounded-full border border-ink p-1">
        {(["shoppers", "merchants"] as const).map((k) => (
          <button
            key={k}
            role="tab"
            type="button"
            aria-selected={who === k}
            aria-controls="hero-promise"
            onClick={() => setWho(k)}
            className={cx(
              "min-h-11 rounded-full px-6 text-body font-medium capitalize transition-colors duration-200 cursor-pointer",
              who === k ? "bg-ink text-paper" : "text-ink hover:bg-ink/10",
            )}
          >
            {k}
          </button>
        ))}
      </div>
      <p id="hero-promise" role="tabpanel" className="max-w-[640px] text-center text-subheading text-ink/80 sm:text-heading-sm sm:leading-snug">
        {COPY[who]}
      </p>
    </div>
  );
}
