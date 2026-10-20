"use client";

import { Ban, Check, ChevronDown, Clock, Loader2, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ruleEffect, type AgentRecord, type MerchantRules, type RuleEffect, type Trust } from "@/lib/trust-core";
import { Badge, PillButton, cx } from "./ui";

type Agent = AgentRecord & { trust: Trust; effect: RuleEffect };

const hours = (min: number) => (min % 60 ? `${(min / 60).toFixed(1)} h` : `${min / 60} h`);

/**
 * Agent trust: every agent that has shopped at this store on one score scale, and the store's rules, which are lines
 * on that scale. Editing a rule previews its effect at once; saving applies it from the next checkout, for every agent.
 */
export function AgentTrust({ refreshKey }: { refreshKey: number }) {
  const [agents, setAgents] = useState<Agent[] | null>(null);
  const [rules, setRules] = useState<MerchantRules | null>(null);
  const [draft, setDraft] = useState<MerchantRules | null>(null);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/merchant/agents", { cache: "no-store" });
    if (!res.ok) return;
    const body = await res.json();
    setAgents(body.agents);
    setRules(body.rules);
    setDraft((d) => d ?? body.rules);
  }, []);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    setSaving(true);
    setNote(null);
    const res = await fetch("/api/merchant/rules", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
    const body = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) return setNote(body.detail ?? "Those rules couldn't be saved. Check the numbers and try again.");
    setDraft(body);
    setNote("Saved. The next checkout from any agent follows these rules.");
    await load();
  }

  const changed = Boolean(draft && rules && JSON.stringify(draft) !== JSON.stringify(rules));
  const set = (patch: Partial<MerchantRules>) => setDraft((d) => (d ? { ...d, ...patch } : d));
  const numberField = "field-focus min-h-11 w-20 rounded-full border border-paper/30 bg-deep px-4 text-paper tabular";

  return (
    <section className="mt-12" aria-labelledby="trust-title">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <h2 id="trust-title" className="display-type text-[36px] leading-none sm:text-[45px]">Agent trust</h2>
        <p className="max-w-md text-body-sm text-muted">Scores come from each agent&apos;s record at this store. Your rules are lines on that score.</p>
      </div>

      {/* Side by side only when the scale still gets real width; otherwise the ledger leads and the rules follow. */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        {/* Who has shopped here, on one scale with the rule lines drawn through it */}
        <TrustLedger agents={agents} rules={draft} preview={changed} />

        {/* The store's rules */}
        <form onSubmit={save} className="on-deep rounded-card bg-deep p-[27px] text-paper sm:p-8" aria-labelledby="rules-title">
          <h3 id="rules-title" className="flex items-center gap-2 heading-type text-heading-sm">
            <ShieldCheck className="size-5 text-field" aria-hidden /> Store rules
          </h3>
          <p className="mt-2 text-body-sm text-paper/75">Applied at checkout to Undo&apos;s own agent and to every agent connecting over MCP.</p>
          {draft ? (
            <div className="mt-6 space-y-5 text-body-sm">
              <fieldset className="space-y-2">
                <legend className="font-medium text-paper">Longer undo window for low-trust agents</legend>
                <label className="flex min-h-11 items-center gap-2">
                  <input type="checkbox" checked={draft.extendBelow !== null} onChange={(e) => set({ extendBelow: e.target.checked ? 50 : null })} className="size-5 accent-field" />
                  On
                </label>
                <div className={cx("flex flex-wrap items-center gap-2", draft.extendBelow === null && "opacity-50")}>
                  <span>Add</span>
                  <select
                    aria-label="Extra undo time"
                    value={draft.extendMinutes}
                    disabled={draft.extendBelow === null}
                    onChange={(e) => set({ extendMinutes: Number(e.target.value) })}
                    className="field-focus min-h-11 rounded-full border border-paper/30 bg-deep px-4 text-paper"
                  >
                    {[60, 180, 360, 720, 1440].map((m) => (
                      <option key={m} value={m}>{hours(m)}</option>
                    ))}
                  </select>
                  <span>for agents scoring below</span>
                  <input
                    aria-label="Score below which agents get more undo time"
                    type="number"
                    min={1}
                    max={100}
                    value={draft.extendBelow ?? 50}
                    disabled={draft.extendBelow === null}
                    onChange={(e) => set({ extendBelow: Math.max(1, Math.min(100, Number(e.target.value) || 1)) })}
                    className={numberField}
                  />
                </div>
              </fieldset>

              <fieldset className="space-y-2 border-t border-paper/15 pt-5">
                <legend className="font-medium text-paper">Block low-trust agents</legend>
                <label className="flex min-h-11 items-center gap-2">
                  <input type="checkbox" checked={draft.blockBelow !== null} onChange={(e) => set({ blockBelow: e.target.checked ? 30 : null })} className="size-5 accent-field" />
                  On
                </label>
                <div className={cx("flex flex-wrap items-center gap-2", draft.blockBelow === null && "opacity-50")}>
                  <span>Refuse agents scoring below</span>
                  <input
                    aria-label="Score below which agents are refused"
                    type="number"
                    min={1}
                    max={100}
                    value={draft.blockBelow ?? 30}
                    disabled={draft.blockBelow === null}
                    onChange={(e) => set({ blockBelow: Math.max(1, Math.min(100, Number(e.target.value) || 1)) })}
                    className={numberField}
                  />
                </div>
              </fieldset>

              <label className="flex items-start gap-2 border-t border-paper/15 pt-5">
                <input type="checkbox" checked={draft.blockUnverified} onChange={(e) => set({ blockUnverified: e.target.checked })} className="mt-0.5 size-5 accent-field" />
                <span>
                  <span className="block font-medium text-paper">Only registered agent operators</span>
                  <span className="text-paper/70">Agents that didn&apos;t present an operator key are refused.</span>
                </span>
              </label>

              <PillButton type="submit" tone="lime" className="w-full" disabled={!changed || saving}>
                {saving && <Loader2 className="size-4 animate-spin" aria-hidden />} {changed ? "Save rules" : "Rules saved"}
              </PillButton>
              {note && <p role="status" className="text-paper/80">{note}</p>}
            </div>
          ) : (
            <p className="mt-6 flex items-center gap-2 text-paper/70"><Loader2 className="size-4 animate-spin" aria-hidden /> Loading rules…</p>
          )}
        </form>
      </div>
    </section>
  );
}

/** Where an agent's points came from: the starting score, what it earned, and what it lost. */
function breakdown(t: Trust) {
  const [start, ...rest] = t.factors;
  const gained = rest.filter((f) => f.points > 0).reduce((s, f) => s + f.points, 0);
  const lost = -rest.filter((f) => f.points < 0).reduce((s, f) => s + f.points, 0);
  return { start: start?.points ?? 0, gained, lost, peak: Math.min(100, (start?.points ?? 0) + gained) };
}

const GRID = "sm:grid-cols-[11rem_1fr_9rem]";

/**
 * Every agent on one 0–100 scale. The rule thresholds are lines through every bar, so who falls on which side reads at
 * a glance; the hatched stretch is what an agent lost to its own mistakes. Outcomes follow the rules being edited
 * (before saving), using the same ruleEffect the server applies at checkout.
 */
function TrustLedger({ agents, rules, preview }: { agents: Agent[] | null; rules: MerchantRules | null; preview: boolean }) {
  if (agents === null || rules === null) {
    return (
      <div className="rounded-card bg-paper p-8">
        <p className="flex items-center gap-3 text-body" role="status"><Loader2 className="size-5 animate-spin" aria-hidden /> Loading agents…</p>
      </div>
    );
  }
  if (!agents.length) return <div className="rounded-card bg-paper p-8 text-body text-muted">No agent has shopped here yet.</div>;

  const rows = agents.map((a) => ({ a, effect: ruleEffect({ name: a.name, verified: a.verified, via: a.via }, a.trust, rules) }));
  const blocked = rows.filter((r) => r.effect.blocked).length;
  const extended = rows.filter((r) => !r.effect.blocked && r.effect.extraMinutes).length;
  const lines = [
    ...(rules.blockBelow !== null ? [{ at: rules.blockBelow, label: `Block under ${rules.blockBelow}`, tone: "bad" as const }] : []),
    ...(rules.extendBelow !== null ? [{ at: rules.extendBelow, label: `+${hours(rules.extendMinutes)} under ${rules.extendBelow}`, tone: "warn" as const }] : []),
  ];

  return (
    <div className="rounded-card bg-paper p-5 sm:p-7">
      {/* The headline, in words */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="heading-type text-subheading">
          {agents.length} agent{agents.length === 1 ? "" : "s"} · {extended ? `${extended} with extra undo time` : "no extra undo time"} ·{" "}
          {blocked ? `${blocked} blocked` : "none blocked"}
        </p>
        {preview && <p className="text-body-sm font-medium text-warn">Previewing your unsaved rules</p>}
      </div>

      {/* Column heads, on the same grid as the rows: the scale, and where each rule line falls */}
      <div className={cx("mt-6 hidden gap-6 border-b border-ink/10 pb-3 text-caption text-muted sm:grid", GRID)} aria-hidden>
        <span className="self-end">Agent</span>
        <div className="relative h-9">
          {lines.map((l) => (
            <span
              key={l.label}
              className={cx("absolute top-0 -translate-x-1/2 whitespace-nowrap font-medium", l.tone === "bad" ? "text-bad" : "text-warn")}
              style={{ left: `${l.at}%` }}
            >
              {l.label}
            </span>
          ))}
          <span className="absolute bottom-0 left-0 tabular">0</span>
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 tabular">50</span>
          <span className="absolute bottom-0 right-0 tabular">100</span>
        </div>
        <span className="self-end text-right">At checkout</span>
      </div>
      {lines.length > 0 && (
        <p className="mt-4 text-caption sm:hidden">
          {lines.map((l, i) => (
            <span key={l.label} className={l.tone === "bad" ? "text-bad" : "text-warn"}>
              {i > 0 ? " · " : ""}
              {l.label}
            </span>
          ))}
        </p>
      )}

      <ul className="divide-y divide-ink/10">
        {rows.map(({ a, effect }) => {
          const b = breakdown(a.trust);
          const side = effect.blocked ? "below the block line" : effect.extraMinutes ? "below the extra-time line" : "clear of every rule";
          return (
            <li key={a.name} className="py-5">
              <div className={cx("grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-3", GRID)}>
                <div className="min-w-0">
                  <p className="truncate text-body font-medium" title={a.name}>{a.name}</p>
                  <p className="text-body-sm text-muted">
                    {a.via === "mcp" ? "MCP" : "Undo web"} · {a.verified ? "registered" : "unregistered"} · {a.purchases} buy{a.purchases === 1 ? "" : "s"}
                  </p>
                </div>

                {/* The score: ink for what it has, hatched for what it lost, the rule lines across it */}
                <div
                  className="relative col-span-2 h-11 sm:col-span-1"
                  role="img"
                  aria-label={`${a.name}: trust ${a.trust.score} of 100${b.lost ? `, after losing ${b.lost} points` : ""}; ${side}.`}
                >
                  <div className="absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 rounded-full bg-ink/[0.06]" />
                  {b.peak > a.trust.score && (
                    <div
                      className="absolute top-1/2 h-2.5 -translate-y-1/2 rounded-r-full"
                      style={{
                        left: `${a.trust.score}%`,
                        width: `${b.peak - a.trust.score}%`,
                        backgroundImage: "repeating-linear-gradient(135deg, rgb(0 0 0 / 0.3) 0 2px, transparent 2px 6px)",
                      }}
                    />
                  )}
                  {a.trust.score > 0 && (
                    <div className="absolute left-0 top-1/2 h-2.5 -translate-y-1/2 rounded-l-full bg-ink" style={{ width: `${a.trust.score}%` }} />
                  )}
                  {lines.map((l) => (
                    <div
                      key={l.label}
                      className={cx("absolute inset-y-1 border-l-2 border-dashed", l.tone === "bad" ? "border-bad" : "border-warn")}
                      style={{ left: `${l.at}%` }}
                    />
                  ))}
                  <span
                    className="absolute top-1/2 grid min-w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink px-2 py-0.5 font-display text-body-sm font-bold text-paper tabular ring-4 ring-paper"
                    style={{ left: `clamp(1.125rem, ${a.trust.score}%, calc(100% - 1.125rem))` }}
                  >
                    {a.trust.score}
                  </span>
                </div>

                <div className="col-start-2 row-start-1 justify-self-end sm:col-start-auto sm:row-start-auto">
                  {effect.blocked ? (
                    <Badge tone="bad" icon={<Ban className="size-3.5" aria-hidden />}>Blocked</Badge>
                  ) : effect.extraMinutes ? (
                    <Badge tone="warn" icon={<Clock className="size-3.5" aria-hidden />}>+{hours(effect.extraMinutes)} to undo</Badge>
                  ) : (
                    <Badge tone="ok" icon={<Check className="size-3.5" aria-hidden />}>Clear</Badge>
                  )}
                </div>
              </div>

              <details className="group mt-1 sm:ml-[12.5rem]">
                <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 text-body-sm text-muted hover:text-ink [&::-webkit-details-marker]:hidden">
                  How it got {a.trust.score}
                  <ChevronDown className="size-4 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" aria-hidden />
                </summary>
                <dl className="mt-1 max-w-sm space-y-1.5 text-body-sm">
                  {a.trust.factors.map((f, i) => (
                    <div key={f.label} className="flex justify-between gap-6">
                      <dt className="text-ink/80">{i === 0 ? `Starting score (${f.label})` : f.label}</dt>
                      <dd className={cx("shrink-0 font-medium tabular", i > 0 && f.points < 0 ? "text-bad" : "text-ink")}>
                        {i > 0 && f.points > 0 ? "+" : ""}
                        {f.points}
                      </dd>
                    </div>
                  ))}
                  {b.start + b.gained - b.lost !== a.trust.score && (
                    <div className="flex justify-between gap-6 text-muted">
                      <dt>Kept between 0 and 100</dt>
                      <dd className="shrink-0 tabular">= {a.trust.score}</dd>
                    </div>
                  )}
                </dl>
              </details>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
