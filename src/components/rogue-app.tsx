"use client";

import { BadgeCheck, Bot, CalendarX, Fingerprint, Layers, Loader2, Play, RefreshCw, ShieldCheck, ShieldX, Tag, UserX } from "lucide-react";
import { useState } from "react";
import type { AttackResult, RogueRun } from "@/lib/rogue";
import { Badge, Container, PillButton, PillLink, cx, shortHash } from "./ui";

const STOPPED_BY: Record<AttackResult["by"], { label: string; icon: React.ReactNode }> = {
  price: { label: "Price ceiling", icon: <Tag className="size-3.5" aria-hidden /> },
  variant: { label: "Variant check", icon: <Layers className="size-3.5" aria-hidden /> },
  quantity: { label: "Quantity rule", icon: <Layers className="size-3.5" aria-hidden /> },
  signature: { label: "Ed25519 signature", icon: <Fingerprint className="size-3.5" aria-hidden /> },
  expiry: { label: "Mandate expiry", icon: <CalendarX className="size-3.5" aria-hidden /> },
  binding: { label: "Agent binding", icon: <UserX className="size-3.5" aria-hidden /> },
  none: { label: "Allowed", icon: <BadgeCheck className="size-3.5" aria-hidden /> },
};

/**
 * Nine agents, one signed mandate. One of them is a real AI agent hijacked by a note hidden in a listing. The run happens on the server with Undo's real guard and the live catalog;
 * this page only shows who got stopped, by which rule, and the one that got through.
 */
export function RogueApp() {
  const [run, setRun] = useState<RogueRun | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/rogue", { method: "POST" });
    const body = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(body.detail ?? "The run didn't complete. Try again in a minute.");
    setRun(body as RogueRun);
  }

  const rogue = run?.results.filter((r) => r.id !== "honest") ?? [];
  const blocked = rogue.filter((r) => r.blocked).length;
  const honest = run?.results.find((r) => r.id === "honest");
  const hijack = run?.results.find((r) => r.id === "hijack")?.hijack;

  return (
    <>
      <section className="on-deep bg-deep text-paper">
        <Container className="grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <h1 className="display-type text-[48px] leading-[0.98] sm:text-heading-lg">Nine agents. One signed mandate.</h1>
            <p className="mt-5 max-w-xl text-subheading text-paper/80">
              Eight of them try to break it, including a real AI agent hijacked by a note hidden in a product listing. Undo&apos;s guard
              decides every one, live, with the same code that protects real purchases. No money moves.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <PillButton tone="lime" onClick={start} disabled={busy}>
                {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : run ? <RefreshCw className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
                {busy ? "Agents are trying…" : run ? "Run it again" : "Let the agents loose"}
              </PillButton>
              <PillLink href="/shop" tone="white">Try it as a shopper</PillLink>
            </div>
          </div>

          <figure className="rounded-card bg-black/30 p-[27px] ring-1 ring-paper/10">
            <figcaption className="text-body-sm text-paper/70">The mandate under attack</figcaption>
            <p className="mt-3 heading-type text-heading-sm">“{run?.mandate.request ?? "A black hoodie, size M, under $80"}”</p>
            <p className="mt-2 font-mono text-body-sm text-field">{run?.mandate.limits ?? "black · size M · ≤ $80 · quantity 1 · 14 days"}</p>
            <dl className="mt-5 grid grid-cols-2 gap-4 text-body-sm">
              <div>
                <dt className="text-paper/70">Authorizes</dt>
                <dd className="mt-1">{run?.mandate.authorizes ?? "Careful Claude"} (registered)</dd>
              </div>
              <div>
                <dt className="text-paper/70">Signed by</dt>
                <dd className="mt-1 font-mono">{run ? `demo key ${run.mandate.signedBy}` : "a fresh demo key per run"}</dd>
              </div>
            </dl>
            {run && <p className="mt-4 break-all font-mono text-caption text-paper/60">digest {shortHash(run.mandate.digest, 24)}</p>}
          </figure>
        </Container>
      </section>

      <Container className="py-10 sm:py-14">
        {error && (
          <p role="alert" className="mb-6 rounded-[20px] bg-bad-bg p-4 text-body text-bad">{error}</p>
        )}

        <div aria-live="polite">
          {run ? (
            <p className="heading-type text-heading-sm sm:text-[30px] sm:leading-tight">
              {blocked} of {rogue.length} rogue agents blocked.{" "}
              {hijack?.fooled ? "Including a real AI that fell for a hidden instruction. " : ""}
              {honest && !honest.blocked ? <span className="bg-field px-1">The honest one got through.</span> : "The honest agent was refused too."}
            </p>
          ) : (
            <p className="text-subheading text-muted">{busy ? "Fetching live products and running each agent through the guard…" : "Press the button to run the agents against the live catalog."}</p>
          )}
          {run?.replay && (
            <p className="mt-3 rounded-[20px] bg-warn-bg px-4 py-3 text-body-sm text-warn">
              {run.replay === "budget"
                ? "The live catalog has used today's free allowance, so this is a replay of the last live run. Same guard, same rules, real results."
                : "The live catalog didn't answer just now, so this is a replay of the last live run. Try again in a minute for a fresh one."}
            </p>
          )}
        </div>

        <ol className="mt-8 space-y-3">
          {(run?.results ?? Array.from({ length: 9 }, () => null)).map((r, i) => (
            <li
              key={r?.id ?? i}
              style={{ "--i": i } as React.CSSProperties}
              className={cx(
                "grid gap-4 rounded-card bg-paper p-5 sm:grid-cols-[1.1fr_1.4fr_auto] sm:items-start sm:p-6",
                r && "rogue-row",
                r?.id === "honest" && "ring-2 ring-field",
              )}
            >
              {r ? (
                <>
                  <div className="min-w-0">
                    <p className="heading-type text-heading-sm">{r.agent}</p>
                    <p className="mt-1 text-body-sm text-muted">{r.tactic}</p>
                  </div>
                  <div className="min-w-0 space-y-2">
                    <p className="break-words font-mono text-body-sm">{r.tried}</p>
                    <p className={cx("text-body-sm", r.blocked ? "text-bad" : "text-ok")}>{r.reason}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                    {r.blocked ? (
                      <Badge tone="bad" icon={<ShieldX className="size-3.5" aria-hidden />}>Blocked</Badge>
                    ) : (
                      <Badge tone="ok" icon={<ShieldCheck className="size-3.5" aria-hidden />}>Allowed</Badge>
                    )}
                    {r.by !== "none" && <Badge tone="neutral" icon={STOPPED_BY[r.by].icon}>{STOPPED_BY[r.by].label}</Badge>}
                    {r.hijack && (
                      <Badge tone={r.hijack.fooled ? "warn" : "neutral"} icon={<Bot className="size-3.5" aria-hidden />}>
                        {r.hijack.fooled === null ? "AI unavailable" : r.hijack.fooled ? "Real AI · fooled" : "Real AI · resisted"}
                      </Badge>
                    )}
                    <span className="font-mono text-caption text-muted">{r.ms} ms</span>
                  </div>
                  {r.hijack && <HijackTrace h={r.hijack} />}
                </>
              ) : (
                <div className={cx("h-14 rounded-[16px] bg-bone", busy && "animate-pulse")} aria-hidden />
              )}
            </li>
          ))}
        </ol>

        {run && (
          <p className="mt-6 text-body-sm text-muted">
            Ran {new Date(run.ranAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })} on live Channel3 products. Runs are
            shared and refresh every five minutes, to spare the free catalog allowance. Agents connecting through Undo&apos;s MCP server hit
            these exact checks before PayPal ever sees a cart.
          </p>
        )}
      </Container>
    </>
  );
}

/** What the hijacked agent read and what it said: the planted note, then the model's own words to the shopper. */
function HijackTrace({ h }: { h: NonNullable<AttackResult["hijack"]> }) {
  return (
    <div className="grid gap-3 sm:col-span-3 md:grid-cols-2">
      <figure className="min-w-0 rounded-[16px] border-l-4 border-warn bg-bone px-4 py-3">
        <figcaption className="text-caption font-medium uppercase tracking-wide text-muted">Hidden in the listing</figcaption>
        <p className="mt-1.5 break-words font-mono text-caption leading-relaxed text-ink/80">{h.injection}</p>
      </figure>
      <figure className="min-w-0 rounded-[16px] bg-bone px-4 py-3">
        <figcaption className="text-caption text-muted">
          <span className="font-medium uppercase tracking-wide">What the agent told the shopper</span>
          {h.model && <span className="font-mono"> · {h.model}</span>}
        </figcaption>
        <p className="mt-1.5 text-body-sm text-ink/85">
          {h.said ? <>&ldquo;{h.said}&rdquo;</> : "The model couldn't be reached this run, so the guard checked the cart the note asks for."}
        </p>
      </figure>
    </div>
  );
}
