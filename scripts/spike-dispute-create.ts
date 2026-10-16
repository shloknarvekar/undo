/**
 * Spike: open a dispute through the API instead of the Resolution Center, so the merchant-fault demo
 * needs no manual clicking.
 *
 *   1. Create + capture a $58 order (you approve it once as the sandbox buyer).
 *   2. Read the buyer's payer_id from the order.
 *   3. POST /v1/customer/disputes as that buyer (PayPal-Auth-Assertion), trying the transaction
 *      reference forms PayPal might accept.
 *   4. Confirm the merchant can see it.
 *
 * Run: npm run spike:dispute-create            (or -- --order=<approved order id> to reuse one)
 */
import "dotenv/config";
import { approveLink, disputes, paypal, PayPalError } from "../src/lib/paypal";

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=") as [string, string]));
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const step = (label: string, detail = "") => console.log(`  ✔ ${label}${detail ? `  ${detail}` : ""}`);

async function approvedOrder(): Promise<string> {
  if (args.order) return args.order;
  const order = await paypal.createAuthorizeOrder(
    { currency_code: "USD", value: "58.00" },
    "Spike E — black hoodie size M (merchant ships navy)",
    "https://example.com/undo/approved",
    "https://example.com/undo/cancelled",
  );
  console.log(`\n  → Approve as your US SANDBOX PERSONAL buyer:\n     ${approveLink(order)}\n`);
  const deadline = Date.now() + 10 * 60_000;
  while (Date.now() < deadline) {
    try {
      if ((await paypal.getOrder(order.id)).status === "APPROVED") return order.id;
    } catch (err) {
      if (err instanceof PayPalError) throw err; // network blips are retried
    }
    await sleep(4000);
  }
  throw new Error("Order not approved within 10 minutes");
}

async function main() {
  console.log("\nUndo · create dispute via API spike\n");
  const orderId = await approvedOrder();
  const authorized = await paypal.authorizeOrder(orderId);
  const auth = authorized.purchase_units?.[0]?.payments?.authorizations?.[0];
  if (!auth) throw new Error("No authorization returned");
  const capture = await paypal.captureAuthorization(auth.id);
  const payerId = (await paypal.getOrder(orderId)).payer?.payer_id;
  if (!payerId) throw new Error("Order has no payer_id");
  step("Captured", `${capture.id} $${capture.amount.value} · buyer payer_id ${payerId.slice(0, 4)}…`);

  const attempts: [string, { buyer_transaction_id?: string; seller_transaction_id?: string }][] = [
    ["seller_transaction_id = capture id", { seller_transaction_id: capture.id }],
    ["buyer_transaction_id = capture id", { buyer_transaction_id: capture.id }],
  ];
  let created = false;
  for (const [label, txn] of attempts) {
    try {
      const res = await disputes.createAsBuyer(
        payerId,
        txn,
        "MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED",
        { currency_code: "USD", value: capture.amount.value },
        "Undo: ordered a black hoodie (signed mandate color=black), received navy.",
      );
      step(`Dispute created via API (${label})`, res.links?.map((l) => l.href.split("/").pop()).join(", ") ?? "");
      created = true;
      break;
    } catch (err) {
      const detail = err instanceof PayPalError ? `${err.message} ${JSON.stringify(err.body).slice(0, 300)}` : String(err);
      console.log(`  ✖ ${label}: ${detail}`);
    }
  }
  if (!created) {
    console.log("\n  API creation not accepted in this sandbox. Fallback: open it in the Resolution Center as before.");
    console.log(`  Capture id for the fallback: ${capture.id}\n`);
    return;
  }

  for (let i = 0; i < 12; i++) {
    const found = (await disputes.list({ disputed_transaction_id: capture.id })).items?.[0];
    if (found) {
      const d = await disputes.get(found.dispute_id);
      step("Merchant sees it", `${d.dispute_id} ${d.status} ${d.dispute_life_cycle_stage} links=${d.links.map((l) => l.rel).join(",")}`);
      console.log(`\n  Drive it with: npm run spike:disputes -- --dispute=${d.dispute_id}\n`);
      return;
    }
    await sleep(5000);
  }
  console.log("  · Created, but not visible to the merchant yet (sandbox lag). Check again later.");
}

main().catch((err) => {
  console.error(`\n✖ ${err instanceof PayPalError ? `${err.message}\n  ${JSON.stringify(err.body, null, 2)}` : err instanceof Error ? err.message : err}`);
  process.exit(1);
});
