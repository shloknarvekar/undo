/**
 * Day-1 spike #2: prove the merchant-side dispute rails Undo needs work in the PayPal sandbox.
 *
 * There is no public API for a buyer to open a dispute, so this script:
 *   1. creates + captures a $64 order (you approve it as the sandbox buyer),
 *   2. waits while you open a dispute on it as that buyer in the sandbox Resolution Center,
 *   3. drives the dispute from the merchant side by following the actions PayPal offers:
 *        --path=evidence (default): provide-evidence → escalate / require-evidence → adjudicate
 *        --path=offer:              make-offer (partial refund, "shopper changed mind")
 *
 * Run:     npm run spike:disputes
 * Resume:  npm run spike:disputes -- --capture=<capture id>   (payment already captured, waiting for dispute)
 *          npm run spike:disputes -- --dispute=PP-D-12345 [--path=offer]
 */
import "dotenv/config";
import { approveLink, disputeActions, disputes, paypal, PayPalError, type Dispute } from "../src/lib/paypal";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=") as [string, string]),
);
const PATH = (args.path ?? "evidence") as "evidence" | "offer";
const POLL_MS = 5000;

const step = (label: string, detail = "") => console.log(`  ✔ ${label}${detail ? `  ${detail}` : ""}`);
const info = (label: string) => console.log(`    ${label}`);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function poll<T>(what: string, minutes: number, fn: () => Promise<T | undefined>): Promise<T> {
  const deadline = Date.now() + minutes * 60_000;
  while (Date.now() < deadline) {
    try {
      const v = await fn();
      if (v !== undefined) return v;
    } catch (err) {
      // Network blips ("fetch failed") shouldn't kill a 20-minute wait; real API errors still do.
      if (err instanceof PayPalError) throw err;
      info(`network hiccup while waiting for ${what} (${err instanceof Error ? err.message : err}), retrying…`);
    }
    await sleep(POLL_MS);
  }
  throw new Error(`Timed out after ${minutes} min waiting for ${what}`);
}

async function createCapturedPayment(): Promise<string> {
  const order = await paypal.createAuthorizeOrder(
    { currency_code: "USD", value: "64.00" },
    "Spike D — black running shoes (merchant will ship navy)",
    "https://example.com/undo/approved",
    "https://example.com/undo/cancelled",
  );
  step("Created AUTHORIZE order", order.id);
  console.log(`\n  → Approve as your SANDBOX PERSONAL buyer:\n     ${approveLink(order)}\n`);
  await poll("order approval", 10, async () =>
    (await paypal.getOrder(order.id)).status === "APPROVED" ? true : undefined,
  );
  const auth = (await paypal.authorizeOrder(order.id)).purchase_units?.[0]?.payments?.authorizations?.[0];
  if (!auth) throw new Error("No authorization returned");
  const capture = await paypal.captureAuthorization(auth.id);
  step("Authorized + captured", `capture ${capture.id} ${capture.status} $${capture.amount.value}`);
  return capture.id;
}

async function waitForDispute(captureId: string): Promise<Dispute> {
  console.log(`
  → Now open a dispute as the SAME sandbox buyer:
     1. Go to https://www.sandbox.paypal.com/myaccount/activity (log in as the buyer)
     2. Open the $64.00 payment to your test store → "Report a problem"
        (or https://www.sandbox.paypal.com/resolutioncenter → Report a problem)
     3. Pick "Item is significantly different from what was described" (or "didn't receive")
     4. Submit. Waiting for the dispute to appear on transaction ${captureId}… (up to 20 min)
`);
  const summary = await poll("dispute to appear", 20, async () => {
    const res = await disputes.list({ disputed_transaction_id: captureId });
    return res.items?.[0];
  });
  return disputes.get(summary.dispute_id);
}

function describe(d: Dispute) {
  info(
    `${d.dispute_id} · reason=${d.reason} · status=${d.status} · stage=${d.dispute_life_cycle_stage ?? "?"} · ` +
      `actions=[${disputeActions(d).filter((a) => a !== "self").join(", ")}]`,
  );
}

async function attempt(label: string, fn: () => Promise<unknown>): Promise<boolean> {
  try {
    await fn();
    step(label);
    return true;
  } catch (err) {
    const msg = err instanceof PayPalError ? `${err.message} (debug-id ${err.debugId})` : String(err);
    console.log(`  ✖ ${label} failed: ${msg}`);
    if (err instanceof PayPalError) info(JSON.stringify(err.body));
    return false;
  }
}

async function drive(disputeId: string) {
  const done = new Set<string>();
  for (let i = 0; i < 12; i++) {
    const d = await poll("dispute details", 2, () => disputes.get(disputeId));
    describe(d);
    if (d.status === "RESOLVED") {
      step("Dispute RESOLVED", `outcome=${d.dispute_outcome?.outcome_code ?? "?"}`);
      return;
    }
    const can = new Set(disputeActions(d));
    const amount = d.dispute_amount ?? { currency_code: "USD", value: "64.00" };

    if (PATH === "offer") {
      if (can.has("make_offer") && !done.has("offer")) {
        const half = { currency_code: amount.currency_code, value: (Number(amount.value) / 2).toFixed(2) };
        await attempt(`make-offer: partial refund $${half.value} (shopper changed mind, merchant protected)`, () =>
          disputes.makeOffer(disputeId, half, "Undo verdict: item matched the signed mandate. Offering 50% as goodwill."),
        );
        done.add("offer");
        info("Buyer must accept a partial offer in the sandbox Resolution Center. Stopping here.");
        return;
      }
    } else if (can.has("provide_evidence") && !done.has("evidence")) {
      done.add("evidence");
      await attempt("provide-evidence: Undo evidence pack (multipart)", () =>
        disputes.provideEvidence(disputeId, [
          {
            evidence_type: "OTHER",
            notes:
              "Undo evidence pack. Intent mandate sha256:3f1c…a9 (signed Ed25519) required color=black, size=10. " +
              "Delivered-item photo classified navy (confidence 0.94). Verdict: MERCHANT_FAULT.",
          },
        ]),
      );
      continue;
    } else if (can.has("adjudicate") && !done.has("adjudicate")) {
      done.add("adjudicate");
      await attempt("adjudicate (sandbox): BUYER_FAVOR", () => disputes.adjudicate(disputeId, "BUYER_FAVOR"));
      continue;
    } else if (can.has("escalate") && !done.has("escalate")) {
      done.add("escalate");
      await attempt("escalate to claim", () => disputes.escalate(disputeId, "Undo: escalating with evidence pack."));
      continue;
    } else if (can.has("require_evidence") && !done.has("require")) {
      done.add("require");
      await attempt("require-evidence (sandbox): SELLER_EVIDENCE", () =>
        disputes.requireEvidence(disputeId, "SELLER_EVIDENCE"),
      );
      continue;
    }
    info("No new action available yet; waiting for PayPal to move the dispute…");
    await sleep(POLL_MS * 2);
  }
  info("Stopped after 12 rounds; run again with --dispute=<id> to continue.");
}

async function main() {
  console.log(`\nUndo · PayPal disputes spike (path=${PATH})\n`);
  let disputeId = args.dispute;
  if (!disputeId) {
    const captureId = args.capture ?? (await createCapturedPayment());
    const d = await waitForDispute(captureId);
    step("Dispute found via list API", d.dispute_id);
    disputeId = d.dispute_id;
  }
  await drive(disputeId);
  console.log(`\nDone. Re-run against this dispute with: npm run spike:disputes -- --dispute=${disputeId}\n`);
}

main().catch((err) => {
  if (err instanceof PayPalError) {
    console.error(`\n✖ ${err.message}\n  paypal-debug-id: ${err.debugId}\n  ${JSON.stringify(err.body, null, 2)}`);
  } else {
    console.error(`\n✖ ${err instanceof Error ? err.message : err}`);
  }
  process.exit(1);
});
