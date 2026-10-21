# How Undo works (/docs/guides/how-undo-works)



## 1. The shopper signs a mandate [#1-the-shopper-signs-a-mandate]

A mandate is what an agent may buy: the item, size, colour, brands, quantity and a price ceiling, in the shopper's own words and as structured limits. It lasts 14 days and allows one live purchase at a time.

1. [`POST /api/mandates/draft`](/api/undo/mandates/draftMandate) turns the shopper's words into a draft. If something is unclear, `mustAsk` lists the questions to answer first.
2. [`POST /api/mandates/prepare`](/api/undo/mandates/prepareMandate) builds the exact mandate and the string to sign.
3. The shopper's device signs it with its Ed25519 key; see [Signing](/guides/signing).
4. [`POST /api/mandates`](/api/undo/mandates/storeMandate) re-checks everything and stores it. This becomes event 0 of the mandate's hash chain.

When an outside agent asks for a mandate over MCP, the shopper gets a link to a [mandate request](/api/undo/mandate-requests/getMandateRequest) instead. The agent's name goes inside the signed bytes, so liability follows it.

## 2. The agent shops, and PayPal only holds the money [#2-the-agent-shops-and-paypal-only-holds-the-money]

[`POST /api/mandates/{mandateId}/shop`](/api/undo/shopping/shopMandate) has Undo's agent search the live catalog and pick a product. Undo then checks the cart against the signed limits, re-reading the product at its exact variant. Only then does PayPal see a cart, and the checkout is created in **AUTHORIZE** mode, so the money is held, not taken.

If the shopper allowed it in the mandate (`payWith: saved_wallet`), the agent can pay with their saved PayPal wallet without a click. The money is still only held.

## 3. The undo window [#3-the-undo-window]

While the window is open, Undo is a free void. Its length depends on the risk:

| Factor                                                        | Adds                 |
| ------------------------------------------------------------- | -------------------- |
| Order total under $20 / under $100 / under $300 / $300 and up | 0 / 1 / 6 / 24 hours |
| An attribute matched only loosely                             | 3 hours              |
| An attribute couldn't be verified from the listing            | 6 hours              |
| Agent confidence below 0.7                                    | 6 hours              |
| The catalog substituted a requested option                    | 12 hours             |
| The agent skipped Undo's check before buying                  | 12 hours             |
| The agent paid with the saved wallet, with no click           | 2 hours              |
| The store's rules for low-trust agents                        | as configured        |

The total is capped at 48 hours. Every order lists its factors in `undoWindow.factors`. When the window closes, the money is captured.

## 4. The shopper presses Undo [#4-the-shopper-presses-undo]

[`POST /api/orders/{orderId}/undo`](/api/undo/orders/undoOrder) must be signed by the mandate's key. A photo of what arrived is optional. The fault check weighs the mandate check, the agent's record, the photo and an AI reading, and returns a verdict:

| Verdict                | Who pays             | Inside the window | After capture                                                |
| ---------------------- | -------------------- | ----------------- | ------------------------------------------------------------ |
| `AGENT_FAULT`          | The agent's operator | Void              | Full refund, then a Payout from the operator to the merchant |
| `MERCHANT_FAULT`       | The merchant         | Void              | A claim with an evidence pack sent to the merchant           |
| `SHOPPER_CHANGED_MIND` | The shopper          | Void              | A return; refund on arrival, minus a 15% restocking fee      |
| `INCONCLUSIVE`         | A person decides     | Review            | Review                                                       |

If the confidence is below 0.7, the case goes to a person. What the shopper says is recorded as a claim, not as evidence.

## 5. The record [#5-the-record]

Every step is an event in the mandate's chain: the cart, the hold, the void or capture, the verdict, the refund, the payout. Each event's hash covers the one before it. [`GET /api/orders/{orderId}/evidence`](/api/undo/orders/getOrderEvidence) returns the raw chain and the signed mandate, so you can [verify it yourself](/guides/verify-evidence).
