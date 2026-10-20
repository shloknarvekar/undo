"use client";

import { Ban, Check, Clock, Loader2, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { AgentRecord, MerchantRules, RuleEffect, Trust } from "@/lib/trust";
import { Badge, PillButton, cx } from "./ui";

type Agent = AgentRecord & { trust: Trust; effect: RuleEffect };

const TIER = { trusted: "ok", neutral: "neutral", risky: "bad" } as const;
const hours = (min: number) => (min % 60 ? `${(min / 60).toFixed(1)} h` : `${min / 60} h`);

/**
 * Agent trust: every agent that has shopped at this store, its score (with every point explained), and the store's
 * rules for who may buy and who gets a longer undo window. Rules apply from the next checkout, for every agent.
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
        <p className="max-w-md text-body-sm text-muted">Every agent&apos;s score comes from its record here: clean purchases, faults, and carts Undo refused.</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Who has shopped here, and what the rules do to each */}
        <div className="overflow-hidden rounded-card bg-paper">
          {agents === null ? (
            <p className="flex items-center gap-3 p-8 text-body" role="status"><Loader2 className="size-5 animate-spin" aria-hidden /> Loading agents…</p>
          ) : agents.length === 0 ? (
            <p className="p-8 text-body text-muted">No agent has shopped here yet.</p>
          ) : (
            <ul className="divide-y divide-ink/10">
              {agents.map((a) => (
                <li key={a.name} className="grid gap-4 p-5 sm:grid-cols-[auto_1fr_auto] sm:items-start sm:p-6">
                  <div className="flex items-center gap-3 sm:block sm:w-20">
                    <p className={cx("display-type text-[40px] leading-none tabular", a.trust.tier === "risky" ? "text-bad" : a.trust.tier === "trusted" ? "text-ok" : "text-ink")}>
                      {a.trust.score}
                    </p>
                    <Badge tone={TIER[a.trust.tier]} className="sm:mt-2">{a.trust.tier}</Badge>
                  </div>
                  <div className="min-w-0">
                    <p className="heading-type text-subheading">{a.name}</p>
                    <p className="text-body-sm text-muted">
                      {a.via === "mcp" ? "via MCP" : "Undo web"} · {a.verified ? "registered" : "unregistered"} · {a.purchases} purchase{a.purchases === 1 ? "" : "s"}
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-caption" aria-label={`How ${a.name} scores ${a.trust.score}`}>
                      {a.trust.factors.map((f, i) => (
                        <li key={f.label} className={f.points < 0 ? "text-bad" : "text-muted"}>
                          {i > 0 && f.points > 0 ? "+" : ""}
                          {f.points} {f.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="sm:text-right">
                    {a.effect.blocked ? (
                      <Badge tone="bad" icon={<Ban className="size-3.5" aria-hidden />}>Blocked</Badge>
                    ) : a.effect.extraMinutes ? (
                      <Badge tone="warn" icon={<Clock className="size-3.5" aria-hidden />}>+{hours(a.effect.extraMinutes)} undo window</Badge>
                    ) : (
                      <Badge tone="ok" icon={<Check className="size-3.5" aria-hidden />}>No extra rules</Badge>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

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
