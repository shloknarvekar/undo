/**
 * Day-1 spike: prove the Undo money rails work in the PayPal sandbox.
 *
 *   Scenario A (undo inside window):   create AUTHORIZE order → buyer approves → authorize → VOID
 *   Scenario B (agent fault after capture): create AUTHORIZE order → approve → authorize → CAPTURE → REFUND
 *
 * Run: npm run spike:paypal
 * You approve both orders in the browser while logged in as your sandbox *personal* account.
 */
import "dotenv/config";
import { approveLink, paypal, PayPalError, type Order } from "../src/lib/paypal";

const RETURN_URL = "https://example.com/undo/approved";
const CANCEL_URL = "https://example.com/undo/cancelled";
const POLL_MS = 4000;
const TIMEOUT_MS = 10 * 60_000;

const step = (label: string, detail = "") => console.log(`  ✔ ${label}${detail ? `  ${detail}` : ""}`);

async function waitForApproval(orderId: string): Promise<void> {
  const deadline = Date.now() + TIMEOUT_MS;
  while (Date.now() < deadline) {
    const order = await paypal.getOrder(orderId);
    if (order.status === "APPROVED") return;
    await new Promise((r) => setTimeout(r, POLL_MS));
  }
  throw new Error(`Order ${orderId} was not approved within ${TIMEOUT_MS / 60000} minutes`);
}

function authorizationOf(order: Order) {
  const auth = order.purchase_units?.[0]?.payments?.authorizations?.[0];
  if (!auth) throw new Error(`No authorization on order ${order.id}`);
  return auth;
}

async function main() {
  console.log("\nUndo · PayPal sandbox spike\n");

  const orderA = await paypal.createAuthorizeOrder(
    { currency_code: "USD", value: "119.00" },
    "Spike A — black running shoes (undo inside window → void)",
    RETURN_URL,
    CANCEL_URL,
  );
  const orderB = await paypal.createAuthorizeOrder(
    { currency_code: "USD", value: "42.50" },
    "Spike B — agent fault after capture (capture → refund)",
    RETURN_URL,
    CANCEL_URL,
  );
  step("OAuth token + created 2 AUTHORIZE orders", `${orderA.id}, ${orderB.id}`);

  console.log("\n  → Open each link, log in with your SANDBOX PERSONAL account, and click Continue/Approve:");
  console.log(`     A: ${approveLink(orderA)}`);
  console.log(`     B: ${approveLink(orderB)}`);
  console.log("    (You'll land on example.com afterwards — that's expected. Waiting for approvals…)\n");

  await Promise.all([waitForApproval(orderA.id), waitForApproval(orderB.id)]);
  step("Both orders APPROVED by buyer");

  // Scenario A — undo inside the window: void the authorization, no money moves.
  const authA = authorizationOf(await paypal.authorizeOrder(orderA.id));
  step("A: authorized", `${authA.id} ${authA.status} $${authA.amount.value}, expires ${authA.expiration_time ?? "?"}`);
  await paypal.voidAuthorization(authA.id);
  const authAAfter = await paypal.getAuthorization(authA.id);
  if (authAAfter.status !== "VOIDED") throw new Error(`A: expected VOIDED, got ${authAAfter.status}`);
  step("A: UNDO → voided", `status=${authAAfter.status} (no capture, no fees)`);

  // Scenario B — window passed, agent at fault: capture, then refund.
  const authB = authorizationOf(await paypal.authorizeOrder(orderB.id));
  step("B: authorized", `${authB.id} ${authB.status} $${authB.amount.value}`);
  const capture = await paypal.captureAuthorization(authB.id);
  step("B: window expired → captured", `${capture.id} ${capture.status}`);
  const refund = await paypal.refundCapture(capture.id, undefined, "Undo: agent bought the wrong size");
  step("B: UNDO (agent fault) → refunded", `${refund.id} ${refund.status} $${refund.amount.value}`);

  console.log("\nAll money rails work. ✅\n");
}

main().catch((err) => {
  if (err instanceof PayPalError) {
    console.error(`\n✖ ${err.message}\n  paypal-debug-id: ${err.debugId}\n  ${JSON.stringify(err.body, null, 2)}`);
  } else {
    console.error(`\n✖ ${err instanceof Error ? err.message : err}`);
  }
  process.exit(1);
});
