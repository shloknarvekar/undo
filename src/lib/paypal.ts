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

function config() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const env = (process.env.PAYPAL_ENV ?? "sandbox") as keyof typeof BASE_URLS;
  if (!clientId || !clientSecret) {
    throw new Error("PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET missing in .env");
  }
  if (!(env in BASE_URLS)) throw new Error(`Unknown PAYPAL_ENV "${env}"`);
  return { clientId, clientSecret, baseUrl: BASE_URLS[env] };
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function accessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;
  const { clientId, clientSecret, baseUrl } = config();
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
  cachedToken = { value: body.access_token, expiresAt: Date.now() + body.expires_in * 1000 };
  return cachedToken.value;
}

/**
 * Every money-moving call gets a PayPal-Request-Id so retries are idempotent.
 * FormData bodies are sent as multipart (fetch sets the boundary), everything else as JSON.
 */
async function call<T>(method: string, path: string, body?: unknown, requestId?: string): Promise<T> {
  const { baseUrl } = config();
  const multipart = body instanceof FormData;
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${await accessToken()}`,
      ...(multipart ? {} : { "Content-Type": "application/json" }),
      Prefer: "return=representation",
      ...(method === "POST" ? { "PayPal-Request-Id": requestId ?? randomUUID() } : {}),
    },
    body: body === undefined ? undefined : multipart ? body : JSON.stringify(body),
  });
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
  links: Link[];
  purchase_units?: { payments?: { authorizations?: Authorization[]; captures?: Capture[] } }[];
};

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
  getOrder: (id: string) => call<Order>("GET", `/v2/checkout/orders/${id}`),
  authorizeOrder: (id: string) => call<Order>("POST", `/v2/checkout/orders/${id}/authorize`, {}),
  getAuthorization: (id: string) => call<Authorization>("GET", `/v2/payments/authorizations/${id}`),
  voidAuthorization: (id: string) => call<Authorization>("POST", `/v2/payments/authorizations/${id}/void`),
  captureAuthorization: (id: string) =>
    call<Capture>("POST", `/v2/payments/authorizations/${id}/capture`, { final_capture: true }),
  refundCapture: (id: string, amount?: Money, note?: string) =>
    call<Refund>("POST", `/v2/payments/captures/${id}/refund`, {
      ...(amount ? { amount } : {}),
      ...(note ? { note_to_payer: note } : {}),
    }),
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

export const disputes = {
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

/** HATEOAS rels the API currently offers on a dispute, e.g. "provide_evidence", "escalate". */
export function disputeActions(d: Dispute): string[] {
  return d.links.map((l) => l.rel.replace(/-/g, "_"));
}

export function approveLink(order: Order): string | undefined {
  return order.links.find((l) => l.rel === "payer-action" || l.rel === "approve")?.href;
}
