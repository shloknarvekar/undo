"use client";

import { AlertTriangle, Camera, ChevronDown, Circle, CreditCard, FastForward, Fingerprint, Link2, Loader2, ShieldCheck, Sparkles, Undo2, UserRound, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { DeviceKeyUnsupported, getDeviceKey, sha256Hex, undoMessage } from "@/lib/device-key";
import { proofSummary, type Proof, type ProofKind } from "@/lib/proof";
import { useFocusTrap } from "./use-focus-trap";
import { Badge, Container, PillButton, PillLink, StatusBadge, VERDICT, VerdictBadge, cx, money, shortHash } from "./ui";

type Evidence = { source: string; finding: string };
type Resolution = {
  decision: { verdict: string; confidence: number; liability: string | null; evidence: Evidence[] };
  action: { type: string; reason: string; refundOnReturn?: string; restockingFee?: string };
  evidencePack?: { digest: string };
  settlement?: { status: string; amount: string; currency: string; from: string; to: string | null; payoutBatchId?: string; transactionId?: string; error?: string };
};
type OrderData = {
  order: {
    id: string;
    status: string;
    amount: string;
    currency: string;
    product: { title: string; brand: string | null; variant: Record<string, string>; imageUrl: string | null; sourceDomain: string; price: number };
    agent: { reasoning: string; guard?: { bypassed: boolean }; simulated?: string; operator?: { name: string; verified: boolean; via?: string } };
    paypal: { orderId: string | null; authorizationId: string | null; captureId: string | null };
    resolution: Resolution | null;
  };
  undoWindow: { minutes: number; endsAt: string | null; open: boolean; factors: { factor: string; minutes: number }[] };
  mandate: { id: string; request: string; shopperKey: string; intent: { attributes: Record<string, string>; maxPrice: number } } | null;
  chain: { intact: boolean; events: { seq: number; type: string; createdAt: string; hash: string; proof: Proof }[] };
};

export const EVENT_LABEL: Record<string, string> = {
  MANDATE_SIGNED: "Mandate signed on your device",
  CART_PROPOSED: "Agent proposed a cart",
  CHECKOUT_CREATED: "PayPal checkout created (authorize only)",
  PAYMENT_AUTHORIZED: "Payment authorized — money held",
  PAYMENT_CAPTURED: "Window closed — payment captured",
  WINDOW_FAST_FORWARDED: "Window fast-forwarded (demo)",
  UNDO_REQUESTED: "You asked to undo (signed)",
  VERDICT: "Fault engine verdict",
  PAYMENT_VOIDED: "Authorization voided — no money moved",
  PAYMENT_REFUNDED: "Refund issued",
  LIABILITY_ASSIGNED: "Liability assigned",
  CLAIM_OPENED: "Claim opened with evidence pack",
  CLAIM_ACCEPTED: "Merchant accepted the claim",
  RETURN_AUTHORIZED: "Return authorized",
  RETURN_RECEIVED: "Return received — refund issued",
  REVIEW_REQUIRED: "Sent to human review",
  CHECKOUT_CANCELLED: "Checkout cancelled",
  AGENT_NO_MATCH: "Agent found nothing that fits",
  AGENT_CART_REJECTED: "Undo refused the agent's cart",
  CHECKOUT_FAILED: "PayPal checkout failed",
  AUTHORIZATION_FAILED: "PayPal authorization failed",
  CAPTURE_FAILED: "Capture failed",
  UNDO_FAILED: "Undo failed",
  LIABILITY_PAYOUT_SENT: "Agent operator paid the merchant back",
  LIABILITY_SETTLED: "Payout confirmed — merchant made whole",
  LIABILITY_PAYOUT_FAILED: "Agent operator's payout failed",
  LIABILITY_UNSETTLED: "Liability recorded, not yet paid",
};

const RESOLVED_HEADLINE: Record<string, string> = {
  VOIDED: "Undone. No money moved.",
  REFUNDED: "Undone. You've been refunded.",
  PARTIALLY_REFUNDED: "Return received. Refund sent.",
  CLAIM_OPEN: "Claim open with the merchant.",
  RETURN_PENDING: "Return authorized.",
  REVIEW: "A person will review this.",
  CANCELLED: "Checkout cancelled.",
  FAILED: "Something went wrong.",
  CAPTURED: "Payment captured.",
  CHECKOUT_CREATED: "Waiting for your PayPal approval.",
};

function useCountdown(endsAt: string | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!endsAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [endsAt]);
  const ms = endsAt ? Math.max(0, Date.parse(endsAt) - now) : 0;
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return { ms, text: `${h}:${pad(m)}:${pad(s)}`, spoken: `${h} hours ${m} minutes` };
}

/** Phone photos are often 5–10 MB: downscale to ≤1600px JPEG before hashing, signing and upload. */
async function preparePhoto(file: File): Promise<{ dataUrl: string; bytes: ArrayBuffer }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob: Blob = await new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("encode failed"))), "image/jpeg", 0.85));
  const bytes = await blob.arrayBuffer();
  const dataUrl = await new Promise<string>((res) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.readAsDataURL(blob);
  });
  return { dataUrl, bytes };
}

function windowWhy(minutes: number) {
  if (minutes < 60) return `${minutes} minutes`;
  const h = Math.round((minutes / 60) * 10) / 10;
  return `${h} hours`;
}

export function OrderApp() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<OrderData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [deviceKey, setDeviceKey] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [photo, setPhoto] = useState<{ dataUrl: string; bytes: ArrayBuffer; name: string } | null>(null);
  const [busy, setBusy] = useState<null | "undo" | "ff">(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/orders/${id}`, { cache: "no-store" });
    if (res.status === 404) return setNotFound(true);
    if (res.ok) setData(await res.json());
  }, [id]);

  useEffect(() => {
    void load();
    getDeviceKey().then((k) => setDeviceKey(k.publicKey)).catch(() => setDeviceKey(""));
  }, [load]);

  const status = data?.order.status;
  useEffect(() => {
    if (status !== "CHECKOUT_CREATED" && status !== "AUTHORIZED") return;
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [status, load]);

  const countdown = useCountdown(status === "AUTHORIZED" ? (data?.undoWindow.endsAt ?? null) : null);

  // Undo dialog: focus stays inside, Escape closes it, focus returns to the button that opened it.
  const dialogRef = useRef<HTMLFormElement>(null);
  useFocusTrap(dialogRef, open, () => setOpen(false));

  async function submitUndo(e: React.FormEvent) {
    e.preventDefault();
    if (!data || reason.trim().length < 3) return;
    setBusy("undo");
    setError(null);
    try {
      const key = await getDeviceKey();
      const requestedAt = new Date().toISOString();
      const photoSha = photo ? await sha256Hex(photo.bytes) : null;
      const signature = await key.sign(await undoMessage(id, reason.trim(), photoSha, requestedAt));
      const res = await fetch(`/api/orders/${id}/undo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim(), requestedAt, signature, ...(photo ? { photo: photo.dataUrl } : {}) }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error === "bad_signature" ? "This device didn't sign the mandate, so it can't undo it." : `Undo failed (${body.error ?? res.status}).`);
      setOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof DeviceKeyUnsupported || err instanceof Error ? err.message : "Undo failed.");
    } finally {
      setBusy(null);
    }
  }

  async function fastForward() {
    setBusy("ff");
    await fetch(`/api/orders/${id}/expire-window`, { method: "POST" });
    await load();
    setBusy(null);
  }

  if (notFound)
    return (
      <Container className="py-20">
        <h1 className="display-type text-[45px]">Order not found</h1>
        <PillLink href="/shop" className="mt-8">Start a new purchase</PillLink>
      </Container>
    );
  if (!data)
    return (
      <Container className="py-20">
        <p className="flex items-center gap-3 text-subheading" role="status"><Loader2 className="size-5 animate-spin" aria-hidden /> Loading your purchase…</p>
      </Container>
    );

  const { order, undoWindow, mandate, chain } = data;
  const isOpen = order.status === "AUTHORIZED" && countdown.ms > 0;
  const undoable = order.status === "AUTHORIZED" || order.status === "CAPTURED";
  const ownsMandate = deviceKey !== null && mandate?.shopperKey === deviceKey;
  const resolved = order.resolution;
  const variant = Object.entries(order.product.variant).map(([k, v]) => `${k} ${v}`).join(" · ");

  return (
    <>
      {/* State band: Rewind while the window is open, Ink once decided */}
      <section className={cx(isOpen ? "bg-field" : resolved ? "on-deep bg-deep text-paper" : "bg-paper")}>
        <Container className="flex flex-col gap-6 py-12 sm:py-16 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <StatusBadge status={order.status} />
            {isOpen ? (
              <>
                <h1 className="sr-only">Purchase held: undo window open</h1>
                <p className="mt-6 display-type text-[64px] leading-none tabular sm:text-display" role="timer" aria-label={`${countdown.spoken} left to undo for free`}>
                  {countdown.text}
                </p>
                <p className="mt-3 text-subheading">left to undo for free — {money(order.amount, order.currency)} is held, not taken.</p>
              </>
            ) : (
              <h1 className="mt-6 display-type text-[45px] leading-none sm:text-heading-lg">{RESOLVED_HEADLINE[order.status] ?? order.status}</h1>
            )}
          </div>
          {undoable && !resolved && (
            <div className="flex flex-col items-start gap-3 lg:items-end">
              <PillButton tone="solid" onClick={() => setOpen(true)} className="px-10 text-subheading" disabled={!ownsMandate}>
                <Undo2 className="size-5" aria-hidden /> Undo this purchase
              </PillButton>
              {!ownsMandate && deviceKey !== null && (
                <p className="max-w-xs text-body-sm text-muted">Only the device that signed this mandate can undo it.</p>
              )}
              {order.status === "AUTHORIZED" && (
                <button type="button" onClick={fastForward} disabled={busy === "ff"} className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-body-sm underline underline-offset-4">
                  {busy === "ff" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <FastForward className="size-4" aria-hidden />} Demo: close the window now
                </button>
              )}
            </div>
          )}
        </Container>
      </section>

      <Container className="grid gap-8 py-10 sm:py-14 lg:grid-cols-[1.25fr_1fr]">
        <div className="space-y-8">
          {resolved && <VerdictCard r={resolved} order={order} />}

          <article className="rounded-card bg-paper p-[27px] sm:p-10" aria-labelledby="product-title">
            <div className="flex flex-col gap-6 sm:flex-row">
              {order.product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={order.product.imageUrl} alt={order.product.title} width={150} height={150} className="size-36 shrink-0 rounded-[24px] bg-bone object-contain" />
              ) : (
                <div className="size-36 shrink-0 rounded-[24px] bg-bone" aria-hidden />
              )}
              <div className="min-w-0">
                <h2 id="product-title" className="heading-type text-heading-sm">{order.product.title}</h2>
                <p className="mt-2 text-body text-muted">{[order.product.brand, variant, order.product.sourceDomain].filter(Boolean).join(" · ")}</p>
                <p className="mt-3 font-mono text-subheading tabular">{money(order.amount, order.currency)}</p>
                {order.agent.simulated && <Badge tone="warn" className="mt-3">Bought by the careless demo agent</Badge>}
                {order.agent.operator?.via === "mcp" && (
                  <Badge tone={order.agent.operator.verified ? "neutral" : "warn"} className="mt-3">
                    Bought by {order.agent.operator.name} via MCP{order.agent.operator.verified ? "" : " (unregistered)"}
                  </Badge>
                )}
              </div>
            </div>
            {mandate && (
              <div className="mt-6 rounded-[24px] bg-bone p-5">
                <p className="flex items-center gap-2 text-body-sm font-medium"><Fingerprint className="size-4" aria-hidden /> Your signed mandate</p>
                <p className="mt-2 text-body">“{mandate.request}”</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(mandate.intent.attributes).map(([k, v]) => (
                    <Badge key={k} tone="neutral">{k}: {v}</Badge>
                  ))}
                  <Badge tone="neutral">≤ {money(mandate.intent.maxPrice)}</Badge>
                </div>
              </div>
            )}
          </article>
        </div>

        <aside className="space-y-8">
          <section className="rounded-card bg-paper p-[27px] sm:p-8" aria-labelledby="chain-title">
            <div className="flex items-center justify-between gap-3">
              <h2 id="chain-title" className="heading-type text-heading-sm">Event chain</h2>
              <Badge tone={chain.intact ? "ok" : "bad"} icon={chain.intact ? <ShieldCheck className="size-3.5" aria-hidden /> : <AlertTriangle className="size-3.5" aria-hidden />}>
                {chain.intact ? "Intact" : "Tampered"}
              </Badge>
            </div>
            <p className="mt-2 text-body-sm text-muted">Every step is hashed into the next. Editing history breaks the chain. Open a step to see how it was decided.</p>
            <ProofSummaryLine proofs={chain.events.map((e) => e.proof)} />
            <ol className="mt-6 space-y-3">
              {chain.events.map((e) => (
                <li key={e.seq} className="flex gap-3">
                  <span className="mt-2.5 grid size-6 shrink-0 place-items-center rounded-full bg-ink font-mono text-[11px] text-paper">{e.seq}</span>
                  <details className="group min-w-0 flex-1 rounded-[16px] transition-colors open:bg-bone">
                    <summary className="flex min-h-11 cursor-pointer list-none items-start justify-between gap-3 rounded-[16px] px-2 py-1.5 transition-colors hover:bg-bone [&::-webkit-details-marker]:hidden">
                      <span className="min-w-0">
                        <span className="block text-body">{EVENT_LABEL[e.type] ?? e.type}</span>
                        <span className="flex flex-wrap items-center gap-x-2 font-mono text-caption text-muted">
                          <span>{new Date(e.createdAt).toLocaleTimeString()}</span>
                          <span className="inline-flex items-center gap-1"><Link2 className="size-3" aria-hidden />{shortHash(e.hash, 12)}</span>
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1.5 pt-0.5">
                        <KindChip kind={e.proof.kind} />
                        <ChevronDown className="size-4 text-muted transition-transform group-open:rotate-180" aria-hidden />
                      </span>
                    </summary>
                    <div className="space-y-3 px-2 pb-3 pt-1 text-body-sm">
                      <p>{e.proof.how}</p>
                      {e.proof.checks?.length ? (
                        <ul className="space-y-2">
                          {e.proof.checks.map((c, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <KindChip kind={c.by} />
                              <span className="min-w-0 pt-0.5 text-ink/85">{c.text}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      {e.proof.api && <p className="break-words font-mono text-caption">{e.proof.api}</p>}
                      {e.proof.ref && <p className="break-all font-mono text-caption text-muted">ref {e.proof.ref}</p>}
                    </div>
                  </details>
                </li>
              ))}
            </ol>
          </section>

          {order.status === "AUTHORIZED" && (
            <section className="rounded-card border border-ink/15 bg-paper p-[27px] sm:p-8">
              <h2 className="heading-type text-heading-sm">Why {windowWhy(undoWindow.minutes)}?</h2>
              <ul className="mt-4 space-y-2 text-body-sm">
                {undoWindow.factors.map((f) => (
                  <li key={f.factor} className="flex justify-between gap-4">
                    <span className="text-muted">{f.factor}</span>
                    <span className="font-mono tabular">+{f.minutes} min</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </Container>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="undo-title">
          <form ref={dialogRef} onSubmit={submitUndo} className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-card bg-paper p-[27px] sm:rounded-card sm:p-10">
            <div className="flex items-start justify-between gap-4">
              <h2 id="undo-title" className="display-type text-[45px] leading-none">Undo</h2>
              <button type="button" onClick={() => setOpen(false)} className="grid size-11 cursor-pointer place-items-center rounded-full hover:bg-bone" aria-label="Close">
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <p className="mt-3 text-body text-muted">
              {isOpen ? "The window is open, so this is a free void whatever the reason." : "The payment was captured. Undo will check who's at fault before any money moves."}
            </p>
            <label htmlFor="reason" className="mt-6 block text-body font-medium">What went wrong?</label>
            <textarea
              id="reason"
              required
              minLength={3}
              maxLength={500}
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Wrong colour — I asked for black."
              className="field-focus mt-2 w-full resize-none rounded-[20px] border border-ink/25 p-4 text-body"
              autoFocus
            />
            <div className="mt-4">
              <input
                ref={fileRef}
                id="photo"
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) setPhoto({ ...(await preparePhoto(f)), name: f.name });
                }}
              />
              {photo ? (
                <div className="flex items-center gap-3 rounded-[20px] bg-bone p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.dataUrl} alt="Photo of the delivered item" className="size-14 rounded-[12px] object-cover" />
                  <span className="min-w-0 flex-1 truncate text-body-sm">{photo.name}</span>
                  <button type="button" className="min-h-11 cursor-pointer px-3 text-body-sm underline" onClick={() => setPhoto(null)}>Remove</button>
                </div>
              ) : (
                <label htmlFor="photo" className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-ink/25 px-5 text-body-sm transition-colors hover:border-ink has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink">
                  <Camera className="size-4" aria-hidden /> Add a photo of what arrived (optional)
                </label>
              )}
            </div>
            {error && <p role="alert" className="mt-4 rounded-[16px] bg-bad-bg p-3 text-body-sm text-bad">{error}</p>}
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <PillButton tone="ink" onClick={() => setOpen(false)}>Keep it</PillButton>
              <PillButton type="submit" tone="solid" disabled={busy === "undo" || reason.trim().length < 3}>
                {busy === "undo" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Fingerprint className="size-4" aria-hidden />}
                {busy === "undo" ? "Checking the evidence…" : "Sign & undo"}
              </PillButton>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function VerdictCard({ r, order }: { r: Resolution; order: OrderData["order"] }) {
  const v = VERDICT[r.decision.verdict];
  const ref = order.paypal.captureId ?? order.paypal.authorizationId;
  return (
    <article className="on-deep rounded-card bg-deep p-[27px] text-paper sm:p-10" aria-labelledby="verdict-title">
      <div className="flex flex-wrap items-center gap-3">
        <VerdictBadge verdict={r.decision.verdict} />
        <span className="font-mono text-body-sm text-paper/70">confidence {r.decision.confidence.toFixed(2)}</span>
      </div>
      <h2 id="verdict-title" className="mt-5 heading-type text-heading-sm sm:text-[30px]">{v?.who ?? "Decision made"}</h2>
      <p className="mt-2 text-body text-paper/80">{r.action.reason}</p>
      <ul className="mt-6 space-y-3">
        {r.decision.evidence.map((e, i) => (
          <li key={i} className="flex flex-col gap-1 text-body-sm sm:flex-row sm:gap-3">
            <span className="shrink-0 font-mono text-field sm:w-32">{e.source.replace("_", " ")}</span>
            <span className="text-paper/90">{e.finding}</span>
          </li>
        ))}
      </ul>
      <div className="mt-7 flex flex-wrap items-center justify-between gap-3 rounded-[20px] bg-paper/10 px-5 py-4">
        <span className="text-body">{r.action.type.replaceAll("_", " ").toLowerCase().replace(/^./, (c) => c.toUpperCase())}</span>
        <span className="font-mono text-body-sm text-paper/70">PayPal {ref ? shortHash(ref, 14) : "—"}{r.evidencePack ? ` · pack ${shortHash(r.evidencePack.digest, 10)}` : ""}</span>
      </div>
      {r.settlement && (
        <p className="mt-3 text-body-sm text-paper/80">
          {r.settlement.status === "SUCCESS"
            ? `${r.settlement.from} has paid the merchant back ${money(r.settlement.amount, r.settlement.currency)} through PayPal Payouts. The mistake cost the merchant nothing.`
            : r.settlement.status === "PENDING"
              ? `${r.settlement.from} is paying the merchant back ${money(r.settlement.amount, r.settlement.currency)}; PayPal is processing it.`
              : `${r.settlement.from} owes the merchant ${money(r.settlement.amount, r.settlement.currency)}. Your refund is not affected.`}
        </p>
      )}
    </article>
  );
}

/** How a step was decided, as a chip: the icon and the word carry the meaning, never colour alone. */
const KIND: Record<ProofKind, { label: string; tone: "ok" | "held" | "neutral"; icon: React.ReactNode }> = {
  signature: { label: "Signature", tone: "ok", icon: <Fingerprint className="size-3.5" aria-hidden /> },
  rule: { label: "Rule", tone: "ok", icon: <ShieldCheck className="size-3.5" aria-hidden /> },
  ai: { label: "AI", tone: "held", icon: <Sparkles className="size-3.5" aria-hidden /> },
  paypal: { label: "PayPal API", tone: "neutral", icon: <CreditCard className="size-3.5" aria-hidden /> },
  person: { label: "Person", tone: "neutral", icon: <UserRound className="size-3.5" aria-hidden /> },
  record: { label: "Record", tone: "neutral", icon: <Circle className="size-3.5" aria-hidden /> },
};

function KindChip({ kind }: { kind: ProofKind }) {
  const k = KIND[kind];
  return (
    <Badge tone={k.tone} icon={k.icon} className="shrink-0 px-2 py-0.5 text-caption">
      {k.label}
    </Badge>
  );
}

/** One line a judge can read in two seconds: how much of this purchase was code, AI, PayPal and people. */
function ProofSummaryLine({ proofs }: { proofs: Proof[] }) {
  const c = proofSummary(proofs);
  const parts = [
    [c.rule, "rule check", "rule checks"],
    [c.ai, "AI judgment", "AI judgments"],
    [c.paypal, "PayPal API call", "PayPal API calls"],
    [c.signature, "signature", "signatures"],
    [c.person, "human step", "human steps"],
  ].filter(([n]) => (n as number) > 0) as [number, string, string][];
  if (!parts.length) return null;
  return (
    <p className="mt-4 rounded-[16px] bg-mist px-4 py-3 text-body-sm">
      This purchase so far: {parts.map(([n, one, many]) => `${n} ${n === 1 ? one : many}`).join(" · ")}.
    </p>
  );
}
