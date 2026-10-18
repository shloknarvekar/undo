"use client";

import { AlertTriangle, ArrowRight, Check, Fingerprint, Loader2, ShieldCheck, Sparkles, Undo2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DeviceKeyUnsupported, getDeviceKey } from "@/lib/device-key";
import { Badge, Container, PillButton, PillLink, cx, money } from "./ui";

type Draft = {
  item: string;
  category?: string;
  quantity: number;
  maxPrice: number;
  currency: string;
  attributes: Record<string, string>;
  gender?: "male" | "female";
  brands?: string[];
  mustAsk: string[];
};
type Considered = { id: string; title: string; price: number; ok: boolean; why?: string };
type ShopResult = {
  orderId: string;
  approveUrl: string;
  cart: { title: string; brand: string | null; variant: Record<string, string>; price: number; currency: string; quantity: number; retailer: string; imageUrl: string | null };
  agent: { reasoning: string; confidence: number; unverified: string[]; guard: { bypassed: boolean; violations: { rule: string; expected: string; actual: string }[] }; considered: Considered[] };
  undoWindow: { minutes: number; factors: { factor: string; minutes: number }[] };
};
type Stage = "ask" | "review" | "signing" | "shopping" | "cart" | "nomatch";

const EXAMPLES = [
  "Black men's running shoes, size 10, under $120",
  "A black hoodie, size M, under $80",
  "Noise cancelling earbuds under $150",
];

async function post<T>(path: string, body: unknown): Promise<{ ok: boolean; status: number; data: T & { error?: string } }> {
  const res = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return { ok: res.ok, status: res.status, data: await res.json().catch(() => ({}) as T & { error?: string }) };
}

const humanError = (e?: string) =>
  ({
    parse_failed: "The AI couldn't read that request. Try rephrasing it.",
    parser_unavailable: "The AI is not configured on this server.",
    no_compliant_product: "Nothing in the catalog satisfies your mandate.",
    agent_failed: "The agent hit a problem while shopping. Try again.",
    paypal_checkout_failed: "PayPal couldn't create the checkout. Try again.",
    bad_signature: "Your device signature didn't verify.",
  })[e ?? ""] ?? (e ? `Something went wrong (${e}).` : "Something went wrong.");

function windowLabel(min: number) {
  if (min === 0) return "captured immediately (low risk)";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export function ShopApp() {
  const [stage, setStage] = useState<Stage>("ask");
  const [request, setRequest] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [careless, setCareless] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [result, setResult] = useState<ShopResult | null>(null);
  const [considered, setConsidered] = useState<Considered[]>([]);

  async function makeDraft(text: string) {
    setBusy(true);
    setError(null);
    const r = await post<{ draft: Draft; ready: { ok: boolean } }>("/api/mandates/draft", { request: text });
    setBusy(false);
    if (!r.ok) return setError(humanError(r.data.error));
    setRequest(text);
    setDraft(r.data.draft);
    setAnswers({});
    setStage("review");
  }

  function answerQuestions() {
    const extra = draft!.mustAsk
      .map((q) => (answers[q]?.trim() ? `${q.replace(/\?$/, "")}: ${answers[q].trim()}.` : ""))
      .filter(Boolean)
      .join(" ");
    if (extra) void makeDraft(`${request}. ${extra}`);
  }

  async function signAndShop() {
    setError(null);
    setStage("signing");
    try {
      const key = await getDeviceKey();
      setFingerprint(key.fingerprint);
      const p = await post<{ mandate: unknown; signingMessage: string }>("/api/mandates/prepare", { request, draft, shopperKey: key.publicKey });
      if (!p.ok) throw new Error(humanError(p.data.error));
      const signature = await key.sign(p.data.signingMessage);
      const m = await post<{ id: string }>("/api/mandates", { mandate: p.data.mandate, signature });
      if (!m.ok) throw new Error(humanError(m.data.error));

      setStage("shopping");
      const s = await post<ShopResult & { considered?: Considered[] }>(`/api/mandates/${m.data.id}/shop`, careless ? { simulate: "unguarded_wrong_variant" } : {});
      if (s.status === 422) {
        setConsidered(s.data.considered ?? []);
        return setStage("nomatch");
      }
      if (!s.ok) throw new Error(humanError(s.data.error));
      setResult(s.data);
      try {
        const recent = JSON.parse(localStorage.getItem("undo:orders") ?? "[]") as string[];
        localStorage.setItem("undo:orders", JSON.stringify([s.data.orderId, ...recent.filter((x) => x !== s.data.orderId)].slice(0, 10)));
      } catch {}
      setStage("cart");
    } catch (err) {
      setError(err instanceof DeviceKeyUnsupported ? err.message : err instanceof Error ? err.message : "Something went wrong.");
      setStage("review");
    }
  }

  // Each stage swaps the whole panel: move focus to its heading so screen readers hear the new step.
  const panelRef = useRef<HTMLDivElement>(null);
  const firstStage = useRef(true);
  useEffect(() => {
    if (firstStage.current) {
      firstStage.current = false;
      return;
    }
    panelRef.current?.querySelector<HTMLElement>("h1")?.focus();
  }, [stage]);

  const ready = draft && draft.mustAsk.length === 0 && draft.maxPrice > 0;
  const stepIndex = { ask: 0, review: 1, signing: 1, shopping: 2, nomatch: 2, cart: 3 }[stage];

  return (
    <Container className="py-10 sm:py-14">
      <ol className="flex flex-wrap gap-2" aria-label="Progress">
        {["Ask", "Sign the mandate", "Agent shops", "Approve in PayPal"].map((label, i) => (
          <li
            key={label}
            aria-current={i === stepIndex ? "step" : undefined}
            className={cx(
              "flex items-center gap-2 rounded-full border px-4 py-2 text-body-sm",
              i < stepIndex && "border-ink bg-ink text-paper",
              i === stepIndex && "border-ink bg-field font-medium",
              i > stepIndex && "border-ink/20 text-muted",
            )}
          >
            {i < stepIndex ? <Check className="size-4" aria-hidden /> : <span className="font-mono">{i + 1}</span>}
            {label}
          </li>
        ))}
      </ol>

      {error && (
        <div role="alert" className="mt-6 flex items-start gap-3 rounded-[20px] bg-bad-bg p-4 text-bad">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p className="text-body">{error}</p>
        </div>
      )}

      <div ref={panelRef} className="[&_h1]:outline-none">
      {stage === "ask" && (
        <section className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_1fr]" aria-labelledby="ask-title">
          <form
            className="rounded-card bg-paper p-[27px] sm:p-10"
            onSubmit={(e) => {
              e.preventDefault();
              if (request.trim().length >= 3) void makeDraft(request.trim());
            }}
          >
            <h1 id="ask-title" tabIndex={-1} className="display-type text-[45px] leading-none sm:text-[55px]">What should your agent buy?</h1>
            <label htmlFor="request" className="mt-8 block text-body font-medium">Tell it in your own words</label>
            <textarea
              id="request"
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="e.g. black running shoes, size 10, under $120"
              className="field-focus mt-2 w-full resize-none rounded-[20px] border border-ink/25 bg-paper p-4 text-subheading"
            />
            <div className="mt-3 flex flex-wrap gap-2" aria-label="Examples">
              {EXAMPLES.map((ex) => (
                <button key={ex} type="button" onClick={() => setRequest(ex)} className="min-h-11 cursor-pointer rounded-full border border-ink/20 px-4 text-body-sm transition-colors hover:border-ink">
                  {ex}
                </button>
              ))}
            </div>
            <div className="mt-8 flex flex-col-reverse items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex min-h-11 cursor-pointer items-center gap-3 text-body-sm text-muted">
                <input type="checkbox" checked={careless} onChange={(e) => setCareless(e.target.checked)} className="size-5 accent-ink" />
                Demo: use a careless agent that skips Undo&apos;s checks
              </label>
              <PillButton type="submit" tone="solid" disabled={busy || request.trim().length < 3}>
                {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Sparkles className="size-4" aria-hidden />}
                {busy ? "Reading your request…" : "Draft my mandate"}
              </PillButton>
            </div>
          </form>
          <aside className="on-deep rounded-card bg-deep p-[27px] text-paper sm:p-10">
            <h2 className="heading-type text-heading-sm">What happens next</h2>
            <ul className="mt-6 space-y-5 text-body">
              <li className="flex gap-3"><Fingerprint className="mt-0.5 size-5 shrink-0 text-field" aria-hidden /> Your request becomes a mandate you sign on this device. The key never leaves your browser.</li>
              <li className="flex gap-3"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-field" aria-hidden /> The agent can only buy what the mandate allows: price, size, colour, quantity.</li>
              <li className="flex gap-3"><Undo2 className="mt-0.5 size-5 shrink-0 text-field" aria-hidden /> You approve in PayPal. The money is held, and you get an undo window.</li>
            </ul>
            <p className="mt-8 text-body-sm text-paper/60">Sandbox only. No real money moves.</p>
          </aside>
        </section>
      )}

      {(stage === "review" || stage === "signing") && draft && (
        <section className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_1fr]" aria-labelledby="review-title">
          <div className="rounded-card bg-paper p-[27px] sm:p-10">
            <h1 id="review-title" tabIndex={-1} className="display-type text-[45px] leading-none">Your mandate</h1>
            <p className="mt-3 text-subheading text-muted">From your words: “{request}”</p>
            <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              <Field label="Item" value={draft.item} />
              <Field label="Budget per item" value={draft.maxPrice > 0 ? `up to ${money(draft.maxPrice, draft.currency)}` : "not set"} missing={draft.maxPrice <= 0} />
              <Field label="Quantity" value={String(draft.quantity)} />
              {draft.gender && <Field label="For" value={draft.gender === "male" ? "Men" : "Women"} />}
              {Object.entries(draft.attributes).map(([k, v]) => (
                <Field key={k} label={k[0].toUpperCase() + k.slice(1)} value={k === "size" && /^[a-z]{1,4}$/i.test(v) ? v.toUpperCase() : v} />
              ))}
              {draft.brands?.length ? <Field label="Brands" value={draft.brands.join(", ")} /> : null}
            </dl>

            {draft.mustAsk.length > 0 && (
              <form
                className="mt-8 rounded-[24px] bg-warn-bg p-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  answerQuestions();
                }}
              >
                <p className="flex items-center gap-2 font-medium text-warn"><AlertTriangle className="size-4" aria-hidden /> The agent needs to know before it can buy:</p>
                <div className="mt-4 space-y-4">
                  {draft.mustAsk.map((q, i) => (
                    <div key={q}>
                      <label htmlFor={`q${i}`} className="block text-body">{q}</label>
                      <input
                        id={`q${i}`}
                        value={answers[q] ?? ""}
                        onChange={(e) => setAnswers((a) => ({ ...a, [q]: e.target.value }))}
                        className="field-focus mt-2 min-h-11 w-full rounded-full border border-ink/25 bg-paper px-5 text-body"
                      />
                    </div>
                  ))}
                </div>
                <PillButton type="submit" tone="ink" className="mt-5" disabled={busy}>
                  {busy && <Loader2 className="size-4 animate-spin" aria-hidden />} Update mandate
                </PillButton>
              </form>
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <PillButton tone="ink" onClick={() => setStage("ask")}>Change request</PillButton>
              <PillButton tone="solid" onClick={signAndShop} disabled={!ready || stage === "signing"}>
                {stage === "signing" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Fingerprint className="size-4" aria-hidden />}
                {stage === "signing" ? "Signing on this device…" : "Sign & let the agent shop"}
              </PillButton>
            </div>
          </div>
          <aside className="rounded-card border border-ink/15 bg-paper p-[27px] sm:p-10">
            <h2 className="heading-type text-heading-sm">The agent can&apos;t buy anything you didn&apos;t sign.</h2>
            <p className="mt-3 text-body text-muted">
              Undo re-checks every cart against this exact mandate. If anything about it is changed later — even the budget —
              the signature stops verifying and the purchase is refused.
            </p>
            {careless && <Badge tone="warn" className="mt-6" icon={<AlertTriangle className="size-3.5" aria-hidden />}>Careless agent on: it will skip the checks</Badge>}
          </aside>
        </section>
      )}

      {stage === "shopping" && (
        <section className="mt-8 rounded-card bg-paper p-[27px] sm:p-12" aria-live="polite" aria-busy="true">
          <Loader2 className="size-8 animate-spin" aria-hidden />
          <h1 tabIndex={-1} className="mt-6 display-type text-[45px] leading-none">The agent is shopping</h1>
          <p className="mt-4 max-w-xl text-subheading text-muted">
            Searching real retailers, re-checking each product at your size and colour, and rejecting anything outside your
            mandate. This usually takes 5–15 seconds.
          </p>
          {fingerprint && <p className="mt-6 font-mono text-body-sm text-muted">Mandate signed by device key {fingerprint}</p>}
        </section>
      )}

      {stage === "nomatch" && (
        <section className="mt-8 rounded-card bg-paper p-[27px] sm:p-10" aria-labelledby="nomatch-title">
          <h1 id="nomatch-title" tabIndex={-1} className="display-type text-[45px] leading-none">Nothing fits your mandate</h1>
          <p className="mt-4 text-subheading text-muted">The agent refused to buy rather than break your rules. Here&apos;s what it checked:</p>
          <ConsideredList items={considered} />
          <PillButton tone="ink" className="mt-8" onClick={() => setStage("review")}>Adjust the mandate</PillButton>
        </section>
      )}

      {stage === "cart" && result && <CartView r={result} careless={careless} />}
      </div>
    </Container>
  );
}

function Field({ label, value, missing }: { label: string; value: string; missing?: boolean }) {
  return (
    <div className="border-t border-ink/15 pt-3">
      <dt className="text-body-sm text-muted">{label}</dt>
      <dd className={cx("mt-1 text-subheading font-medium", missing && "text-warn")}>{value}</dd>
    </div>
  );
}

function ConsideredList({ items }: { items: Considered[] }) {
  if (!items.length) return null;
  return (
    <ul className="mt-6 divide-y divide-ink/10 rounded-[24px] border border-ink/15">
      {items.map((c) => (
        <li key={c.id} className="flex items-start justify-between gap-4 p-4">
          <div className="min-w-0">
            <p className="truncate text-body font-medium">{c.title}</p>
            {c.why && <p className="mt-1 text-body-sm text-muted">{c.why}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="font-mono text-body-sm tabular">{money(c.price)}</span>
            <Badge tone={c.ok ? "ok" : "bad"}>{c.ok ? "Fits" : "Rejected"}</Badge>
          </div>
        </li>
      ))}
    </ul>
  );
}

function CartView({ r, careless }: { r: ShopResult; careless: boolean }) {
  const { cart, agent, undoWindow } = r;
  const variant = Object.entries(cart.variant).map(([k, v]) => `${k} ${v}`).join(" · ");
  return (
    <section className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_1fr]" aria-labelledby="cart-title">
      <div className="rounded-card bg-paper p-[27px] sm:p-10">
        <div className="flex flex-col gap-6 sm:flex-row">
          {cart.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cart.imageUrl} alt={cart.title} width={180} height={180} className="size-44 shrink-0 rounded-[24px] bg-bone object-contain" />
          ) : (
            <div className="size-44 shrink-0 rounded-[24px] bg-bone" aria-hidden />
          )}
          <div className="min-w-0 flex-1">
            <h1 id="cart-title" tabIndex={-1} className="heading-type text-heading-sm sm:text-[30px] sm:leading-tight">{cart.title}</h1>
            <p className="mt-2 text-body text-muted">{[cart.brand, variant, cart.retailer].filter(Boolean).join(" · ")}</p>
            <p className="mt-4 display-type text-[45px] leading-none tabular">{money(cart.price * cart.quantity, cart.currency)}</p>
          </div>
        </div>
        <div className="mt-8 rounded-[24px] bg-bone p-5">
          <p className="text-body-sm font-medium">Agent&apos;s reasoning</p>
          <p className="mt-2 text-body">{agent.reasoning}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge tone={agent.confidence >= 0.8 ? "ok" : "warn"}>Confidence {Math.round(agent.confidence * 100)}%</Badge>
            {agent.guard.bypassed ? (
              <Badge tone="bad" icon={<AlertTriangle className="size-3.5" aria-hidden />}>Checks skipped</Badge>
            ) : (
              <Badge tone="ok" icon={<ShieldCheck className="size-3.5" aria-hidden />}>Passed Undo&apos;s checks</Badge>
            )}
            {agent.unverified.map((u) => (
              <Badge key={u} tone="warn">Unverified: {u}</Badge>
            ))}
          </div>
          {agent.guard.violations.length > 0 && (
            <ul className="mt-4 space-y-1 text-body-sm text-bad">
              {agent.guard.violations.map((v) => (
                <li key={v.rule}>Breaks mandate — {v.rule.replace("attribute:", "")}: wanted {v.expected}, got {v.actual}</li>
              ))}
            </ul>
          )}
        </div>
        <details className="mt-6">
          <summary className="cursor-pointer text-body font-medium">What else it considered ({agent.considered.length})</summary>
          <ConsideredList items={agent.considered} />
        </details>
      </div>

      <aside className="on-deep flex flex-col rounded-card bg-deep p-[27px] text-paper sm:p-10">
        <p className="display-type text-[45px] leading-none">{undoWindow.minutes ? windowLabel(undoWindow.minutes) : "No window"}</p>
        <p className="mt-2 text-body text-paper/80">
          {undoWindow.minutes ? "to undo for free once you approve. The money is only held." : "Low risk, so the payment is captured as soon as you approve."}
        </p>
        <ul className="mt-6 space-y-2 text-body-sm text-paper/75">
          {undoWindow.factors.map((f) => (
            <li key={f.factor} className="flex justify-between gap-4">
              <span>{f.factor}</span>
              <span className="font-mono tabular text-field">{f.minutes ? `+${windowLabel(f.minutes)}` : "—"}</span>
            </li>
          ))}
        </ul>
        <PillLink href={r.approveUrl} tone="lime" className="mt-8">
          Approve in PayPal <ArrowRight className="arrow size-4" aria-hidden />
        </PillLink>
        <p className="mt-4 text-body-sm text-paper/60">
          You&apos;ll log in with your PayPal sandbox buyer and come straight back here.{careless ? " This purchase came from the careless demo agent." : ""}
        </p>
      </aside>
    </section>
  );
}
