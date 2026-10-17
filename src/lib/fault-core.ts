/**
 * Fault engine decision rules and money routing. Pure, unit-tested.
 *
 * Layering: certain facts (mandate vs. what the agent bought) decide first; AI findings (delivered photo,
 * fuzzy intent) only decide when they clear CONFIDENCE; anything else goes to a human. The money route then
 * depends on the verdict *and* where the payment is: inside the undo window every Undo is a free void.
 */
import { sha256Hex } from "./crypto";
import type { Violation } from "./mandate";

/**
 * What the shopper's device signs to ask for an Undo: binds the order, the stated reason, the photo and the
 * time, so nobody but the mandate's signer can trigger one and a request can't be replayed or altered.
 */
export function undoSigningMessage(orderId: string, reason: string, photoSha256: string | null, requestedAt: string): string {
  return `undo-request-v1:${orderId}:${sha256Hex(reason)}:${photoSha256 ?? "-"}:${requestedAt}`;
}

export const CONFIDENCE = 0.7;
export const RESTOCKING_FEE = 0.15;

export type Verdict = "AGENT_FAULT" | "MERCHANT_FAULT" | "SHOPPER_CHANGED_MIND" | "INCONCLUSIVE";
export type Liability = "agent_operator" | "merchant" | "shopper" | null;

export type Evidence = { source: "mandate_check" | "agent_record" | "delivered_photo" | "ai_judgement" | "shopper"; finding: string };

export type Findings = {
  /** Deterministic: mandate vs. the product the agent actually bought. */
  cartViolations: Violation[];
  /** From the agent's own record at purchase time. */
  guardBypassed: boolean;
  relaxed: { option: string; requested: string; resolved: string | null }[];
  /** Vision: does the delivered item match what was ordered? null when no photo was given. */
  delivered: { matchesOrder: boolean; mismatches: string[]; confidence: number } | null;
  /** LLM: does the ordered product satisfy what the shopper meant, on what rules couldn't prove? */
  intent: { satisfiesMandate: boolean; problems: string[]; confidence: number } | null;
  shopperReason: string;
};

export type Decision = { verdict: Verdict; confidence: number; liability: Liability; evidence: Evidence[] };

const liabilityOf: Record<Verdict, Liability> = {
  AGENT_FAULT: "agent_operator",
  MERCHANT_FAULT: "merchant",
  SHOPPER_CHANGED_MIND: "shopper",
  INCONCLUSIVE: null,
};

export function decide(f: Findings): Decision {
  const evidence: Evidence[] = [{ source: "shopper", finding: f.shopperReason }];
  const done = (verdict: Verdict, confidence: number): Decision => ({
    verdict,
    confidence: Math.round(confidence * 100) / 100,
    liability: liabilityOf[verdict],
    evidence,
  });

  // 1. Certain: the agent bought something the signed mandate didn't allow.
  if (f.cartViolations.length || f.relaxed.length) {
    for (const v of f.cartViolations) evidence.push({ source: "mandate_check", finding: `${v.rule}: mandate required ${v.expected}, agent bought ${v.actual}` });
    for (const r of f.relaxed) evidence.push({ source: "mandate_check", finding: `catalog substituted ${r.option} ${r.requested} → ${r.resolved ?? "none"}` });
    if (f.guardBypassed) evidence.push({ source: "agent_record", finding: "agent skipped Undo's pre-purchase check" });
    return done("AGENT_FAULT", 1);
  }

  // 2. The item that arrived isn't the item that was ordered.
  if (f.delivered && !f.delivered.matchesOrder && f.delivered.confidence >= CONFIDENCE) {
    for (const m of f.delivered.mismatches) evidence.push({ source: "delivered_photo", finding: m });
    return done("MERCHANT_FAULT", f.delivered.confidence);
  }

  // 3. What was ordered doesn't match what the shopper meant, on attributes rules couldn't verify.
  if (f.intent && !f.intent.satisfiesMandate && f.intent.confidence >= CONFIDENCE) {
    for (const p of f.intent.problems) evidence.push({ source: "ai_judgement", finding: p });
    return done("AGENT_FAULT", f.intent.confidence);
  }

  // 4. Everything checks out: the agent and merchant did what was asked.
  const intentOk = !f.intent || (f.intent.satisfiesMandate && f.intent.confidence >= CONFIDENCE);
  const deliveryOk = !f.delivered || (f.delivered.matchesOrder && f.delivered.confidence >= CONFIDENCE);
  if (intentOk && deliveryOk) {
    evidence.push({ source: "mandate_check", finding: "purchase satisfies every hard constraint in the signed mandate" });
    if (f.delivered) evidence.push({ source: "delivered_photo", finding: "delivered item matches the order" });
    const confidence = Math.min(f.intent?.confidence ?? 0.9, f.delivered?.confidence ?? 0.9);
    return done("SHOPPER_CHANGED_MIND", confidence);
  }

  // 5. Mixed or weak signals: a person decides.
  if (f.delivered) evidence.push({ source: "delivered_photo", finding: `photo check inconclusive (${f.delivered.confidence})` });
  if (f.intent) evidence.push({ source: "ai_judgement", finding: `intent check inconclusive (${f.intent.confidence})` });
  return done("INCONCLUSIVE", Math.max(f.delivered?.confidence ?? 0, f.intent?.confidence ?? 0));
}

export type MoneyAction =
  | { type: "VOID"; reason: string }
  | { type: "REFUND_FULL"; reason: string }
  | { type: "OPEN_CLAIM"; reason: string }
  | { type: "AUTHORIZE_RETURN"; refundOnReturn: string; restockingFee: string; reason: string }
  | { type: "REVIEW"; reason: string }
  | { type: "NONE"; reason: string };

const cents = (n: number) => (Math.round(n * 100) / 100).toFixed(2);

/** What happens to the money, given the verdict and where the payment stands. */
export function route(verdict: Verdict, status: string, amount: string): MoneyAction {
  if (status === "AUTHORIZED") {
    return { type: "VOID", reason: "undo window open: authorization voided, no money moved, no fees" };
  }
  if (status !== "CAPTURED") return { type: "NONE", reason: `nothing to undo while the order is ${status}` };
  switch (verdict) {
    case "AGENT_FAULT":
      return { type: "REFUND_FULL", reason: "agent broke the mandate: full refund, liability on the agent operator" };
    case "MERCHANT_FAULT":
      return { type: "OPEN_CLAIM", reason: "wrong item delivered: evidence pack sent to the merchant" };
    case "SHOPPER_CHANGED_MIND": {
      const total = Number(amount);
      return {
        type: "AUTHORIZE_RETURN",
        refundOnReturn: cents(total * (1 - RESTOCKING_FEE)),
        restockingFee: cents(total * RESTOCKING_FEE),
        reason: "agent and merchant followed the mandate: merchant protected, refund on return minus restocking fee",
      };
    }
    case "INCONCLUSIVE":
      return { type: "REVIEW", reason: "not confident enough to move money automatically: human review" };
  }
}
