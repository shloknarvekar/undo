/**
 * Proof view: for each event in a purchase's hash chain, how that step was decided and what it touched.
 * Pure, derived only from what the event recorded, so the order page can show "4 PayPal API calls, 6 rule checks,
 * 1 AI judgment" without anyone taking Undo's word for it.
 */

/** signature: cryptography · rule: deterministic code · ai: a model's judgment · paypal: a PayPal API call · person: a human or demo action */
export type ProofKind = "signature" | "rule" | "ai" | "paypal" | "person" | "record";

export type ProofCheck = { by: Exclude<ProofKind, "record" | "paypal">; text: string };

export type Proof = {
  kind: ProofKind;
  /** One line on how this step was decided. */
  how: string;
  /** For PayPal steps: the API call made. */
  api?: string;
  /** The id that proves it happened (PayPal id, digest, payout transaction…). */
  ref?: string;
  /** Individual checks behind a decision step (cart guard, verdict). */
  checks?: ProofCheck[];
};

type Payload = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);
const money = (v: unknown) => {
  if (typeof v === "string") return v;
  const m = v as { value?: string; currency_code?: string } | undefined;
  return m?.value ? `${m.value} ${m.currency_code ?? ""}`.trim() : undefined;
};

const EVIDENCE_BY: Record<string, ProofCheck["by"]> = {
  mandate_check: "rule",
  agent_record: "rule",
  delivered_photo: "ai",
  ai_judgement: "ai",
  shopper: "person",
};

export function proofFor(type: string, payload: unknown): Proof {
  const p = (payload ?? {}) as Payload;
  switch (type) {
    case "MANDATE_SIGNED": {
      const agent = p.agent as { name?: string; verified?: boolean } | undefined;
      return {
        kind: "signature",
        how: `Ed25519 signature from the shopper's device verified against the mandate's exact bytes${agent?.name ? `; it authorizes ${agent.name} only` : ""}.`,
        ref: str(p.digest),
      };
    }
    case "CART_PROPOSED": {
      const agent = (p.agent ?? {}) as {
        guard?: { bypassed?: boolean; violations?: { rule: string; expected: string; actual: string }[] };
        model?: string | null;
        confidence?: number;
        operator?: { name?: string; via?: string };
        unverified?: string[];
      };
      const risk = p.risk as { minutes?: number } | undefined;
      const checks: ProofCheck[] = [];
      if (agent.guard?.bypassed) {
        checks.push({ by: "rule", text: "The agent skipped Undo's pre-purchase guard (careless demo agent)." });
        for (const v of agent.guard.violations ?? []) checks.push({ by: "rule", text: `Breaks the mandate: ${v.rule.replace("attribute:", "")} should be ${v.expected}, is ${v.actual}.` });
      } else {
        checks.push({ by: "rule", text: "Re-fetched the live product and checked price, quantity, size, colour and brand against the mandate." });
      }
      if (agent.unverified?.length) checks.push({ by: "rule", text: `Couldn't verify from the listing: ${agent.unverified.join(", ")}. The undo window was lengthened.` });
      if (agent.model) checks.push({ by: "ai", text: `${agent.model} ranked only candidates that had already passed the rules (confidence ${Math.round((agent.confidence ?? 0) * 100)}%).` });
      if (agent.operator?.via === "mcp") checks.push({ by: "person", text: `Cart chosen by ${agent.operator.name ?? "an outside agent"} over MCP, then checked by Undo.` });
      if (risk?.minutes !== undefined) checks.push({ by: "rule", text: `Undo window set to ${risk.minutes} min by the risk rules.` });
      return { kind: "rule", how: agent.guard?.bypassed ? "Proposed without Undo's guard." : "Undo's guard passed the cart before PayPal saw it.", checks };
    }
    case "AGENT_CART_REJECTED":
      return {
        kind: "rule",
        how: "Undo's guard refused the cart; nothing was sent to PayPal.",
        checks: [...((p.violations as string[]) ?? []), ...((p.substitutions as string[]) ?? [])].map((text) => ({ by: "rule" as const, text })),
      };
    case "CHECKOUT_CREATED":
      return { kind: "paypal", how: "PayPal order created to authorize only: money can be held, not taken.", api: "POST /v2/checkout/orders (intent AUTHORIZE)", ref: str(p.paypalOrderId) };
    case "PAYMENT_AUTHORIZED": {
      const held = `${money(p.amount) ?? "the payment"} is held${str(p.windowEndsAt) ? ` until ${new Date(String(p.windowEndsAt)).toUTCString()}` : ""}`;
      return p.paidWith === "saved_wallet"
        ? {
            kind: "paypal",
            how: `The agent paid with the shopper's saved PayPal wallet, with no click, because the signed mandate allows it; ${held}.`,
            api: "POST /v2/checkout/orders (payment_source.paypal.vault_id)",
            ref: str(p.authorizationId),
          }
        : { kind: "paypal", how: `The shopper approved in PayPal; ${held}.`, api: "POST /v2/checkout/orders/{id}/authorize", ref: str(p.authorizationId) };
    }
    case "PAYMENT_CAPTURED":
      return { kind: "paypal", how: `Captured: ${str(p.reason) ?? "the undo window closed"}.`, api: "POST /v2/payments/authorizations/{id}/capture", ref: str(p.captureId) };
    case "WINDOW_FAST_FORWARDED":
      return { kind: "person", how: "The demo button closed the undo window early." };
    case "UNDO_REQUESTED":
      return {
        kind: "signature",
        how: `The Undo request was signed by the same device key that signed the mandate${str(p.photoSha256) ? ", including the photo's hash" : ""}.`,
        ref: str(p.photoSha256),
      };
    case "VERDICT": {
      const evidence = (p.evidence as { source: string; finding: string }[]) ?? [];
      return {
        kind: "rule",
        how: `Verdict ${String(p.verdict ?? "").replaceAll("_", " ").toLowerCase()} at confidence ${Number(p.confidence ?? 0).toFixed(2)}: rules first, AI only for what rules can't settle, a person when it's close.`,
        checks: evidence.map((e) => ({ by: EVIDENCE_BY[e.source] ?? "rule", text: e.finding })),
      };
    }
    case "PAYMENT_VOIDED":
      return { kind: "paypal", how: "Authorization voided: no money moved and no fees.", api: "POST /v2/payments/authorizations/{id}/void", ref: str(p.authorizationId) };
    case "PAYMENT_REFUNDED":
      return { kind: "paypal", how: `Refunded ${money(p.amount) ?? "in full"} to the shopper.`, api: "POST /v2/payments/captures/{id}/refund", ref: str(p.refundId) };
    case "LIABILITY_ASSIGNED":
      return { kind: "rule", how: `The agent broke the mandate, so the cost is billed to ${str(p.operator) ?? "the agent operator"}, not the merchant.` };
    case "LIABILITY_PAYOUT_SENT":
      return { kind: "paypal", how: `${str(p.operator) ?? "The agent operator"} sent ${str(p.amount) ?? "the refund amount"} to the merchant from its own PayPal account.`, api: "POST /v1/payments/payouts", ref: str(p.payoutBatchId) };
    case "LIABILITY_SETTLED":
      return { kind: "paypal", how: `PayPal confirmed the payout: the merchant is made whole.`, api: "GET /v1/payments/payouts/{id}", ref: str(p.transactionId) ?? str(p.payoutBatchId) };
    case "CLAIM_OPENED":
      return {
        kind: "rule",
        how: "Claim opened against the merchant with a signed evidence pack.",
        ref: str(p.evidenceDigest),
        checks: ((p.evidence as { source: string; finding: string }[]) ?? []).map((e) => ({ by: EVIDENCE_BY[e.source] ?? "rule", text: e.finding })),
      };
    case "CLAIM_ACCEPTED":
      return { kind: "paypal", how: `The merchant accepted the claim; ${money(p.amount) ?? "a full refund"} went back to the shopper.`, api: "POST /v2/payments/captures/{id}/refund", ref: str(p.refundId) };
    case "RETURN_AUTHORIZED":
      return { kind: "rule", how: `Shopper changed their mind: return authorized, refund ${str(p.refundOnReturn) ?? ""} after a ${str(p.restockingFee) ?? ""} restocking fee.`.replace(/\s+/g, " ") };
    case "RETURN_RECEIVED":
      return { kind: "paypal", how: `Return received; ${money(p.refunded) ?? "a partial refund"} refunded.`, api: "POST /v2/payments/captures/{id}/refund (partial)", ref: str(p.refundId) };
    case "REVIEW_REQUIRED":
      return { kind: "person", how: "Not confident enough to move money automatically: sent to a person.", ref: str(p.evidenceDigest) };
    case "CHECKOUT_CANCELLED":
      return { kind: "person", how: "The shopper cancelled in PayPal." };
    default:
      return { kind: "record", how: "Recorded in the chain." };
  }
}

/** How many steps of each kind a purchase took (the order page's one-line summary). */
export function proofSummary(proofs: Proof[]) {
  const count = { signature: 0, rule: 0, ai: 0, paypal: 0, person: 0 };
  for (const p of proofs) {
    if (p.kind === "paypal") count.paypal++;
    const checks = p.checks?.length ? p.checks : p.kind === "signature" || p.kind === "rule" || p.kind === "person" ? [{ by: p.kind }] : [];
    for (const c of checks) count[c.by]++;
  }
  return count;
}
