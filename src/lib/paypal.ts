import { randomUUID } from "node:crypto";

const BASE_URLS = {
  sandbox: "https://api-m.sandbox.paypal.com",
  live: "https://api-m.paypal.com",
} as const;

export class PayPalError extends Error {
  constructor(
    message: string,
    public status: number,
    public debugId: string | null,
    public body: unknown,
  ) {
    super(message);
  }
}

/**
 * Two PayPal accounts act through this client: the merchant (Undo Demo Store, the default) and the agent
 * operator, who settles agent-fault liability to the merchant through Payouts from its own balance.
 */
type Account = "merchant" | "operator";

function config(account: Account = "merchant") {
  const prefix = account === "operator" ? "PAYPAL_OPERATOR_" : "PAYPAL_";
  const clientId = process.env[`${prefix}CLIENT_ID`];
  const clientSecret = process.env[`${prefix}CLIENT_SECRET`];
  const env = (process.env.PAYPAL_ENV ?? "sandbox") as keyof typeof BASE_URLS;
  if (!clientId || !clientSecret) {
    throw new Error(`${prefix}CLIENT_ID / ${prefix}CLIENT_SECRET missing in .env`);
  }
  if (!(env in BASE_URLS)) throw new Error(`Unknown PAYPAL_ENV "${env}"`);
  return { clientId, clientSecret, baseUrl: BASE_URLS[env] };
}

/** True when the agent-operator account is configured, i.e. liability can actually be settled. */
export const operatorConfigured = () => Boolean(process.env.PAYPAL_OPERATOR_CLIENT_ID && process.env.PAYPAL_OPERATOR_CLIENT_SECRET);

const cachedTokens: Partial<Record<Account, { value: string; expiresAt: number }>> = {};

async function accessToken(account: Account = "merchant"): Promise<string> {
  const cachedToken = cachedTokens[account];
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;
  const { clientId, clientSecret, baseUrl } = config(account);
  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const body = await res.json();
  if (!res.ok) {
    throw new PayPalError(
      `OAuth failed: ${body.error_description ?? res.statusText}`,
      res.status,
      res.headers.get("paypal-debug-id"),
      body,
    );
  }
  cachedTokens[account] = { value: body.access_token, expiresAt: Date.now() + body.expires_in * 1000 };
  return body.access_token as string;
}

/**
 * PayPal-Auth-Assertion lets the app act on behalf of another PayPal account (e.g. the sandbox buyer
 * opening a dispute). It is an unsigned JWT: {"alg":"none"} . {iss: client id, payer_id} . (empty signature).
 */
export function authAssertion(payerId: string): string {
  const b64url = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");
  return `${b64url({ alg: "none" })}.${b64url({ iss: config().clientId, payer_id: payerId })}.`;
}

/**
 * Every money-moving call gets a PayPal-Request-Id so retries are idempotent.
 * FormData bodies are sent as multipart (fetch sets the boundary), everything else as JSON.
 */
async function call<T>(
  method: string,
  path: string,
  body?: unknown,
  requestId?: string,
  extraHeaders: Record<string, string> = {},
  account: Account = "merchant",
  retried = false,
): Promise<T> {
  const { baseUrl } = config(account);
  const multipart = body instanceof FormData;
  const idempotencyKey = method === "POST" ? (requestId ?? randomUUID()) : undefined;
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${await accessToken(account)}`,
      ...(multipart ? {} : { "Content-Type": "application/json" }),
      Prefer: "return=representation",
      ...(idempotencyKey ? { "PayPal-Request-Id": idempotencyKey } : {}),
      ...extraHeaders,
    },
    body: body === undefined ? undefined : multipart ? body : JSON.stringify(body),
  });
  // A token PayPal ended early (revoked, or app permissions changed) is replaced once, then the call is retried.
  // The PayPal-Request-Id is kept, so a retried money call can't run twice.
  if (res.status === 401 && !retried) {
    delete cachedTokens[account];
    return call<T>(method, path, body, idempotencyKey, extraHeaders, account, true);
  }
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const detail = json.details?.[0]?.issue ?? json.name ?? res.statusText;
    throw new PayPalError(`${method} ${path} → ${res.status} ${detail}`, res.status, res.headers.get("paypal-debug-id"), json);
  }
  return json as T;
}

type Link = { href: string; rel: string; method?: string };
type Money = { currency_code: string; value: string };

export type Authorization = { id: string; status: string; amount: Money; expiration_time?: string };
export type Capture = { id: string; status: string; amount: Money };
export type Refund = { id: string; status: string; amount: Money };
export type Order = {
  id: string;
  status: string;
  payer?: { payer_id?: string; email_address?: string; address?: { country_code?: string } };
  links: Link[];
  purchase_units?: { payee?: { merchant_id?: string; email_address?: string }; payments?: { authorizations?: Authorization[]; captures?: Capture[] } }[];
};

/** Orders v2 items[].image_url pattern (an https URL ending in an image extension, max 2048 chars). */
const PAYPAL_IMAGE_URL = /^https:\/\/[^\s?#]{1,2030}\.(?:jpe?g|gif|png)$/i;

export const paypal = {
  createAuthorizeOrder(amount: Money, description: string, returnUrl: string, cancelUrl: string) {
    return call<Order>("POST", "/v2/checkout/orders", {
      intent: "AUTHORIZE",
      purchase_units: [{ amount, description }],
      payment_source: {
        paypal: {
          experience_context: {
            user_action: "CONTINUE",
            shipping_preference: "NO_SHIPPING",
            return_url: returnUrl,
            cancel_url: cancelUrl,
          },
        },
      },
    });
  },
  /**
   * The agent's checkout: one line item, AUTHORIZE intent (money is held, not taken, until the undo window
   * closes). custom_id ties the PayPal order back to the Undo order; the request id makes retries safe.
   */
  /**
   * The agent's purchase, AUTHORIZE only. With `returnUrl`/`cancelUrl` the shopper approves in PayPal; with `vaultId`
   * the shopper's saved wallet pays with no redirect, and PayPal authorizes in the same call (status COMPLETED).
   */
  createAgentOrder(o: {
    undoOrderId: string;
    item: { name: string; sku: string; quantity: number; unitPrice: string; currency: string; url?: string; imageUrl?: string };
    pay: { returnUrl: string; cancelUrl: string } | { vaultId: string };
  }) {
    const { item } = o;
    const total = (Number(item.unitPrice) * item.quantity).toFixed(2);
    return call<Order>(
      "POST",
      "/v2/checkout/orders",
      {
        intent: "AUTHORIZE",
        purchase_units: [
          {
            reference_id: o.undoOrderId,
            custom_id: o.undoOrderId,
            description: `Undo agent purchase · ${item.name}`.slice(0, 127),
            amount: {
              currency_code: item.currency,
              value: total,
              breakdown: { item_total: { currency_code: item.currency, value: total } },
            },
            items: [
              {
                name: item.name.slice(0, 127),
                sku: item.sku.slice(0, 127),
                quantity: String(item.quantity),
                unit_amount: { currency_code: item.currency, value: item.unitPrice },
                category: "PHYSICAL_GOODS",
                ...(item.url?.startsWith("https://") ? { url: item.url.slice(0, 2048) } : {}),
                // PayPal only accepts image URLs ending in an image extension; CDN links without one are rejected.
                ...(item.imageUrl && PAYPAL_IMAGE_URL.test(item.imageUrl) ? { image_url: item.imageUrl } : {}),
              },
            ],
          },
        ],
        payment_source: {
          paypal:
            "vaultId" in o.pay
              ? { vault_id: o.pay.vaultId }
              : {
                  experience_context: {
                    brand_name: "Undo Demo Store",
                    user_action: "CONTINUE",
                    shipping_preference: "NO_SHIPPING",
                    return_url: o.pay.returnUrl,
                    cancel_url: o.pay.cancelUrl,
                  },
                },
        },
      },
      `undo-order-${o.undoOrderId}`,
    );
  },
  getOrder: (id: string) => call<Order>("GET", `/v2/checkout/orders/${id}`),
  /** Same request id for the same order, so a double-hit return URL can't authorize twice. */
  authorizeOrder: (id: string) => call<Order>("POST", `/v2/checkout/orders/${id}/authorize`, {}, `undo-authorize-${id}`),
  getAuthorization: (id: string) => call<Authorization>("GET", `/v2/payments/authorizations/${id}`),
  // Money calls use deterministic request ids: a retried or racing call (scheduler vs. Undo) gets PayPal's
  // original response instead of moving money twice.
  voidAuthorization: (id: string) =>
    call<Authorization>("POST", `/v2/payments/authorizations/${id}/void`, undefined, `undo-void-${id}`),
  captureAuthorization: (id: string) =>
    call<Capture>("POST", `/v2/payments/authorizations/${id}/capture`, { final_capture: true }, `undo-capture-${id}`),
  /** `key` distinguishes different refunds of the same capture (e.g. "full" vs "return"). */
  refundCapture: (id: string, amount?: Money, note?: string, key = "full") =>
    call<Refund>(
      "POST",
      `/v2/payments/captures/${id}/refund`,
      {
        ...(amount ? { amount } : {}),
        ...(note ? { note_to_payer: note.slice(0, 255) } : {}),
      },
      `undo-refund-${id}-${key}`,
    ),
};

export type Dispute = {
  dispute_id: string;
  reason: string;
  status: string;
  dispute_state?: string;
  dispute_life_cycle_stage?: string;
  dispute_amount?: Money;
  dispute_outcome?: { outcome_code: string };
  disputed_transactions?: { seller_transaction_id?: string; buyer_transaction_id?: string }[];
  links: Link[];
};

export type Evidence = {
  evidence_type: "PROOF_OF_FULFILLMENT" | "PROOF_OF_REFUND" | "OTHER";
  evidence_info?: { tracking_info?: { carrier_name: string; tracking_number: string }[]; refund_ids?: string[] };
  notes?: string;
};

/** Multipart body with the JSON payload in the `input` part, as the Disputes API expects. */
function inputPart(payload: unknown, files: { name: string; data: Blob; filename: string }[] = []) {
  const form = new FormData();
  form.append("input", new Blob([JSON.stringify(payload)], { type: "application/json" }), "input.json");
  for (const f of files) form.append(f.name, f.data, f.filename);
  return form;
}

export type DisputeReason =
  | "MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED"
  | "MERCHANDISE_OR_SERVICE_NOT_RECEIVED"
  | "UNAUTHORISED";

export const disputes = {
  /**
   * Buyer-side: open a dispute as the buyer (sandbox testing guide flow). Needs the app's disputes/create
   * scope and a PayPal-Auth-Assertion for the buyer's payer_id. `transaction` is the disputed transaction
   * reference, e.g. { buyer_transaction_id } or { seller_transaction_id }.
   * Status: a standard sandbox app gets "No permissions to set target_client_id" (partner permission from
   * PayPal required). Until granted, buyers open disputes in the Resolution Center.
   */
  createAsBuyer: (
    buyerPayerId: string,
    transaction: { buyer_transaction_id?: string; seller_transaction_id?: string },
    reason: DisputeReason,
    amount: Money,
    note: string,
  ) =>
    call<{ links?: Link[] }>(
      "POST",
      "/v1/customer/disputes",
      inputPart({
        disputed_transactions: [transaction],
        reason,
        dispute_amount: amount,
        note,
        extensions: {
          merchant_contacted: true,
          merchant_contacted_outcome: "NO_RESPONSE",
          ...(reason === "MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED"
            ? { merchandize_dispute_properties: { issue_type: "PRODUCT" } }
            : {}),
        },
      }),
      undefined,
      { "PayPal-Auth-Assertion": authAssertion(buyerPayerId) },
    ),
  list: (params: Record<string, string> = {}) =>
    call<{ items?: Dispute[] }>("GET", `/v1/customer/disputes?${new URLSearchParams(params)}`),
  get: (id: string) => call<Dispute>("GET", `/v1/customer/disputes/${id}`),
  provideEvidence: (id: string, evidences: Evidence[], files?: { data: Blob; filename: string }[]) =>
    call<unknown>(
      "POST",
      `/v1/customer/disputes/${id}/provide-evidence`,
      inputPart({ evidences }, (files ?? []).map((f) => ({ name: "evidence_file", ...f }))),
    ),
  makeOffer: (id: string, offerAmount: Money, note: string) =>
    call<unknown>("POST", `/v1/customer/disputes/${id}/make-offer`, {
      note,
      offer_amount: offerAmount,
      offer_type: "REFUND",
    }),
  escalate: (id: string, note: string) => call<unknown>("POST", `/v1/customer/disputes/${id}/escalate`, { note }),
  /** Sandbox only. */
  requireEvidence: (id: string, action: "SELLER_EVIDENCE" | "BUYER_EVIDENCE") =>
    call<unknown>("POST", `/v1/customer/disputes/${id}/require-evidence`, { action }),
  /** Sandbox only. */
  adjudicate: (id: string, outcome: "BUYER_FAVOR" | "SELLER_FAVOR") =>
    call<unknown>("POST", `/v1/customer/disputes/${id}/adjudicate`, { adjudication_outcome: outcome }),
};

export type CatalogProduct = { id: string; name: string; type: string; image_url?: string; home_url?: string };

export const catalog = {
  /** Pass a stable requestId (e.g. the source product id) so re-running an import doesn't duplicate products. */
  createProduct: (
    p: { name: string; description?: string; image_url?: string; home_url?: string },
    requestId: string,
  ) =>
    call<CatalogProduct>(
      "POST",
      "/v1/catalogs/products",
      {
        name: p.name.slice(0, 127),
        type: "PHYSICAL",
        ...(p.description ? { description: p.description.slice(0, 256) } : {}),
        ...(p.image_url?.startsWith("https://") ? { image_url: p.image_url } : {}),
        ...(p.home_url?.startsWith("https://") ? { home_url: p.home_url } : {}),
      },
      requestId,
    ),
  get: (id: string) => call<CatalogProduct>("GET", `/v1/catalogs/products/${id}`),
};

/** HATEOAS rels the API currently offers on a dispute, e.g. "provide_evidence", "escalate". */
export function disputeActions(d: Dispute): string[] {
  return d.links.map((l) => l.rel.replace(/-/g, "_"));
}

/** Events Undo listens to: money rails, disputes, and catalog (catalog gives a signed event with no buyer step). */
export const WEBHOOK_EVENTS = [
  "CHECKOUT.ORDER.APPROVED",
  "PAYMENT.AUTHORIZATION.CREATED",
  "PAYMENT.AUTHORIZATION.VOIDED",
  "PAYMENT.CAPTURE.COMPLETED",
  "PAYMENT.CAPTURE.REFUNDED",
  "CUSTOMER.DISPUTE.CREATED",
  "CUSTOMER.DISPUTE.UPDATED",
  "CUSTOMER.DISPUTE.RESOLVED",
  "CATALOG.PRODUCT.CREATED",
] as const;

export type Webhook = { id: string; url: string; event_types: { name: string }[] };
export type WebhookEvent = {
  id: string;
  event_type: string;
  create_time: string;
  resource_type?: string;
  summary?: string;
  resource?: { id?: string; status?: string; [k: string]: unknown };
};

export const webhooks = {
  list: () => call<{ webhooks: Webhook[] }>("GET", "/v1/notifications/webhooks"),
  create: (url: string, events: readonly string[]) =>
    call<Webhook>("POST", "/v1/notifications/webhooks", {
      url,
      event_types: events.map((name) => ({ name })),
    }),
  /**
   * Ask PayPal whether a delivery is genuine. Needs the transmission headers PayPal sent and the id of the
   * webhook it was delivered to. Returns true only for verification_status SUCCESS.
   */
  async verify(headers: Headers, event: unknown, webhookId: string): Promise<boolean> {
    const h = (name: string) => headers.get(name) ?? "";
    const res = await call<{ verification_status: string }>("POST", "/v1/notifications/verify-webhook-signature", {
      auth_algo: h("paypal-auth-algo"),
      cert_url: h("paypal-cert-url"),
      transmission_id: h("paypal-transmission-id"),
      transmission_sig: h("paypal-transmission-sig"),
      transmission_time: h("paypal-transmission-time"),
      webhook_id: webhookId,
      webhook_event: event,
    });
    return res.verification_status === "SUCCESS";
  },
};

export type PayoutBatch = {
  batch_header: { payout_batch_id: string; batch_status: string; sender_batch_header?: { sender_batch_id: string } };
  items?: { payout_item_id: string; transaction_id?: string; transaction_status?: string; errors?: { name?: string; message?: string } }[];
};

/**
 * Payouts v1, sent from the agent operator's own account: this is how an agent-fault verdict becomes real money
 * moving from the operator to the merchant. One batch per order (sender_batch_id + PayPal-Request-Id), so a retry
 * can never pay twice.
 */
export const payouts = {
  /** `attempt` only advances after PayPal denied a batch; repeating the same attempt is always a no-op. */
  settle(o: { orderId: string; attempt: number; merchantPayPalId: string; amount: string; currency: string; note: string }) {
    const batchKey = `undo-settle-${o.orderId}-${o.attempt}`;
    return call<PayoutBatch>(
      "POST",
      "/v1/payments/payouts",
      {
        sender_batch_header: {
          sender_batch_id: batchKey,
          email_subject: "Undo: agent liability settlement",
          email_message: o.note,
        },
        items: [
          {
            recipient_type: "PAYPAL_ID",
            receiver: o.merchantPayPalId,
            amount: { value: o.amount, currency: o.currency },
            note: o.note,
            sender_item_id: o.orderId,
          },
        ],
      },
      batchKey,
      {},
      "operator",
    );
  },
  get(batchId: string) {
    return call<PayoutBatch>("GET", `/v1/payments/payouts/${batchId}`, undefined, undefined, {}, "operator");
  },
};

export type SetupToken = { id: string; status: string; links?: Link[] };
export type PaymentToken = { id: string; customer?: { id: string } };

/**
 * PayPal Vault v3: the shopper approves saving their PayPal wallet once (setup token), and Undo keeps the resulting
 * payment token. Only this PayPal app can charge it, and every charge is still an AUTHORIZE with an undo window.
 */
export const vault = {
  createSetupToken: (o: { returnUrl: string; cancelUrl: string }) =>
    call<SetupToken>("POST", "/v3/vault/setup-tokens", {
      payment_source: {
        paypal: {
          description: "Undo: your shopping agent pays inside the mandate you sign, and you can always undo",
          usage_pattern: "IMMEDIATE",
          usage_type: "MERCHANT",
          customer_type: "CONSUMER",
          permit_multiple_payment_tokens: false,
          experience_context: { brand_name: "Undo", shipping_preference: "NO_SHIPPING", return_url: o.returnUrl, cancel_url: o.cancelUrl },
        },
      },
    }),
  getSetupToken: (id: string) => call<SetupToken>("GET", `/v3/vault/setup-tokens/${id}`),
  /** Deterministic request id: a refreshed return page can't create two payment tokens. */
  createPaymentToken: (setupTokenId: string) =>
    call<PaymentToken>("POST", "/v3/vault/payment-tokens", { payment_source: { token: { id: setupTokenId, type: "SETUP_TOKEN" } } }, `undo-vault-${setupTokenId}`),
  deletePaymentToken: (id: string) => call<Record<string, never>>("DELETE", `/v3/vault/payment-tokens/${id}`),
};

export function approveLink(order: Order): string | undefined {
  return order.links.find((l) => l.rel === "payer-action" || l.rel === "approve")?.href;
}
