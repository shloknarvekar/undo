"use client";

import { AlertTriangle, BadgeCheck, Check, Fingerprint, Loader2, ShieldAlert } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AutopayOption } from "./autopay-option";
import { DeviceKeyUnsupported, getDeviceKey } from "@/lib/device-key";
import { Badge, Container, PillButton, PillLink, cx, money } from "./ui";

type Draft = {
  item: string;
  quantity: number;
  maxPrice: number;
  currency: string;
  attributes: Record<string, string>;
  gender?: "male" | "female";
  brands?: string[];
  mustAsk: string[];
};
type RequestData = {
  id: string;
  request: string;
  draft: Draft;
  ready: { ok: boolean };
  agent: { name: string; verified: boolean };
  status: "PENDING" | "SIGNED" | "EXPIRED";
  mandateId: string | null;
  expiresAt: string;
};

async function post<T>(id: string, body: unknown): Promise<{ ok: boolean; data: T & { error?: string; detail?: string } }> {
  const res = await fetch(`/api/mandate-requests/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return { ok: res.ok, data: await res.json().catch(() => ({}) as T & { error?: string; detail?: string }) };
}

const ERRORS: Record<string, string> = {
  parse_failed: "The AI couldn't read your answer. Try saying it another way.",
  parser_unavailable: "Undo's AI isn't reachable right now. Try again in a minute.",
  bad_signature: "Your device's signature didn't verify. Reload and try again.",
  mandate_does_not_match_request: "The request changed while you were reading it. Reload to see the latest version.",
  request_expired: "This request expired. Ask your agent for a new link.",
};

/**
 * The shopper's half of an outside agent's request: read the limits, answer any open questions, and sign on this
 * device. The agent only gets to shop once this page has been signed; it never sees the key.
 */
export function SignApp() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<RequestData | null>(null);
  const [missing, setMissing] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<null | "answer" | "sign">(null);
  const [error, setError] = useState<string | null>(null);
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [autopay, setAutopay] = useState(false);
  const [walletSaved, setWalletSaved] = useState(false);
  const [paysItself, setPaysItself] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/mandate-requests/${id}`, { cache: "no-store" });
    if (res.status === 404) return setMissing(true);
    if (res.ok) setData(await res.json());
  }, [id]);
  useEffect(() => {
    void load();
  }, [load]);

  async function answer(e: React.FormEvent) {
    e.preventDefault();
    setBusy("answer");
    setError(null);
    const r = await post<{ request: string; draft: Draft; ready: { ok: boolean } }>(id, { action: "answer", answers });
    setBusy(null);
    if (!r.ok) return setError((r.data.error === "rate_limited" && r.data.detail) || (ERRORS[r.data.error ?? ""] ?? "That didn't work. Try again."));
    setAnswers({});
    setData((d) => (d ? { ...d, request: r.data.request, draft: r.data.draft, ready: r.data.ready } : d));
  }

  async function sign() {
    setBusy("sign");
    setError(null);
    try {
      const key = await getDeviceKey();
      setFingerprint(key.fingerprint);
      const payWith = autopay && walletSaved ? ("saved_wallet" as const) : undefined;
      const p = await post<{ mandate: unknown; signingMessage: string }>(id, { action: "prepare", shopperKey: key.publicKey, ...(payWith ? { payWith } : {}) });
      if (!p.ok) throw new Error(ERRORS[p.data.error ?? ""] ?? "Undo couldn't prepare the mandate.");
      const signature = await key.sign(p.data.signingMessage);
      const s = await post<{ mandateId: string }>(id, { action: "sign", mandate: p.data.mandate, signature });
      if (!s.ok) throw new Error(ERRORS[s.data.error ?? ""] ?? "Undo couldn't store the signature.");
      setPaysItself(Boolean(payWith));
      await load();
    } catch (err) {
      setError(err instanceof DeviceKeyUnsupported || err instanceof Error ? err.message : "Signing failed.");
    } finally {
      setBusy(null);
    }
  }

  if (missing)
    return (
      <Container className="py-20">
        <h1 className="display-type text-[45px] leading-none">This link doesn&apos;t exist</h1>
        <p className="mt-4 text-subheading text-muted">Ask your agent for a new one.</p>
      </Container>
    );
  if (!data)
    return (
      <Container className="py-20">
        <p className="flex items-center gap-3 text-subheading" role="status"><Loader2 className="size-5 animate-spin" aria-hidden /> Loading the request…</p>
      </Container>
    );

  const { draft, agent } = data;
  const signed = data.status === "SIGNED";

  return (
    <Container className="grid gap-8 py-10 sm:py-14 lg:grid-cols-[1.3fr_1fr]">
      <section className="rounded-card bg-paper p-[27px] sm:p-10" aria-labelledby="sign-title">
        <div className="flex flex-wrap items-center gap-2">
          {agent.verified ? (
            <Badge tone="ok" icon={<BadgeCheck className="size-3.5" aria-hidden />}>Registered agent operator</Badge>
          ) : (
            <Badge tone="warn" icon={<ShieldAlert className="size-3.5" aria-hidden />}>Unregistered agent: name not verified</Badge>
          )}
        </div>
        <h1 id="sign-title" className="mt-5 display-type text-[40px] leading-[1.02] sm:text-[52px]">
          {signed ? "Signed." : <>{agent.name} wants to shop for you</>}
        </h1>
        <p className="mt-3 text-subheading text-muted">From your words: “{data.request}”</p>

        <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          <Field label="Item" value={draft.item} />
          <Field label="Budget per item" value={draft.maxPrice > 0 ? `up to ${money(draft.maxPrice, draft.currency)}` : "not set"} missing={draft.maxPrice <= 0} />
          <Field label="Quantity" value={String(draft.quantity)} />
          {draft.gender && <Field label="For" value={draft.gender === "male" ? "Men" : "Women"} />}
          {Object.entries(draft.attributes).map(([k, v]) => (
            <Field key={k} label={k[0].toUpperCase() + k.slice(1)} value={k === "size" && /^[a-z]{1,4}$/i.test(v) ? v.toUpperCase() : v} />
          ))}
          {draft.brands?.length ? <Field label="Brands" value={draft.brands.join(", ")} /> : null}
          <Field label="Agent allowed" value={agent.name} />
        </dl>

        {error && (
          <div role="alert" className="mt-6 flex items-start gap-3 rounded-[20px] bg-bad-bg p-4 text-bad">
            <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden />
            <p className="text-body">{error}</p>
          </div>
        )}

        {data.status === "EXPIRED" && <p className="mt-8 rounded-[20px] bg-warn-bg p-4 text-body text-warn">This request expired. Ask {agent.name} for a new link.</p>}

        {data.status === "PENDING" && draft.mustAsk.length > 0 && (
          <form className="mt-8 rounded-[24px] bg-warn-bg p-5" onSubmit={answer}>
            <p className="flex items-center gap-2 font-medium text-warn"><AlertTriangle className="size-4" aria-hidden /> Before {agent.name} can buy, answer:</p>
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
            <PillButton type="submit" tone="ink" className="mt-5" disabled={busy !== null}>
              {busy === "answer" && <Loader2 className="size-4 animate-spin" aria-hidden />} Update the limits
            </PillButton>
          </form>
        )}

        {data.status === "PENDING" && (
          <div className="mt-8">
            <AutopayOption checked={autopay} onCheckedChange={setAutopay} onSavedChange={setWalletSaved} returnTo={`/mandates/sign/${id}`} />
          </div>
        )}

        {data.status === "PENDING" && (
          <div className="mt-8">
            <PillButton tone="solid" onClick={sign} disabled={!data.ready.ok || busy !== null}>
              {busy === "sign" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Fingerprint className="size-4" aria-hidden />}
              {busy === "sign" ? "Signing on this device…" : autopay && walletSaved ? `Sign & let ${agent.name} buy` : `Sign & let ${agent.name} shop`}
            </PillButton>
            {!data.ready.ok && <p className="mt-3 text-body-sm text-muted">Answer the questions above first.</p>}
          </div>
        )}

        {signed && (
          <div className="mt-8 flex items-start gap-3 rounded-[24px] bg-ok-bg p-5 text-ok" role="status">
            <Check className="mt-0.5 size-5 shrink-0" aria-hidden />
            <p className="text-body">
              Go back to {agent.name}. It can now shop inside these limits, and Undo will refuse any cart that breaks them.
              {paysItself ? " It will pay with your saved PayPal wallet without asking you; the purchase page lets you undo it." : ""}
              {fingerprint && <span className="mt-1 block font-mono text-body-sm">Signed by device key {fingerprint}</span>}
            </p>
          </div>
        )}
      </section>

      <aside className="on-deep rounded-card bg-deep p-[27px] text-paper sm:p-10">
        <h2 className="heading-type text-heading-sm">What you&apos;re agreeing to</h2>
        <ul className="mt-6 space-y-4 text-body text-paper/85">
          <li className="flex gap-3"><Fingerprint className="mt-0.5 size-5 shrink-0 text-field" aria-hidden /> Only {agent.name} may buy, and only within these limits. Your key never leaves this device.</li>
          <li className="flex gap-3"><BadgeCheck className="mt-0.5 size-5 shrink-0 text-field" aria-hidden /> Undo checks every cart before PayPal sees it. Anything outside the limits is refused.</li>
          <li className="flex gap-3"><Check className="mt-0.5 size-5 shrink-0 text-field" aria-hidden /> You still approve the payment in PayPal. It&apos;s held, not taken, and you can undo it from this device.</li>
        </ul>
        <p className="mt-8 text-body-sm text-paper/70">Sandbox only. No real money moves.</p>
        {signed && (
          <PillLink href="/shop" tone="white" className="mt-8">
            Or shop with Undo&apos;s own agent
          </PillLink>
        )}
      </aside>
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
