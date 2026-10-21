# Quickstart (/docs/guides/quickstart)



This order is a finished case from the live sandbox: a careless agent bought shoes in size 10.5 when the shopper signed for 10. The money had already been captured when the shopper pressed Undo. The fault check found the agent at fault, so the shopper got a full refund and the agent's operator paid the merchant back through PayPal Payouts.

## Read the order [#read-the-order]

```bash title="curl"
curl -s https://undo-1c56.onrender.com/api/orders/edd288bc-42d0-41d3-9b87-14915f3ff2c6
```

```ts title="TypeScript"
import { UndoApiClient } from "undo-api";

const client = new UndoApiClient();
const { order, undoWindow, chain } = await client.orders.getOrder({
  orderId: "edd288bc-42d0-41d3-9b87-14915f3ff2c6",
});

console.log(order.status, order.amount); // REFUNDED 116.97
console.log(chain.intact, chain.events.length); // true 12
```

```python title="Python"
from undo_api import UndoApiClient

view = UndoApiClient().orders.get_order("edd288bc-42d0-41d3-9b87-14915f3ff2c6")
print(view.order.status, view.order.amount)  # REFUNDED 116.97
print(view.chain.intact, len(view.chain.events))  # True 12
```

## What comes back [#what-comes-back]

| Field              | What it tells you                                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------------------- |
| `order.status`     | Where the purchase stands. `AUTHORIZED` means the money is only held and Undo is a free void.                  |
| `order.paypal`     | The PayPal order, authorization and capture ids behind it.                                                     |
| `order.resolution` | The verdict, the evidence, what happened to the money, and any payout from the agent's operator.               |
| `undoWindow`       | How long the window is, why, and whether it's still open.                                                      |
| `chain.events`     | Every step, oldest first. Each one carries a `proof` saying how it was decided and which PayPal call backs it. |

## Next [#next]

* [How Undo works](/guides/how-undo-works): the flow from mandate to payout.
* [Verify an order yourself](/guides/verify-evidence): check the hashes and signatures without trusting Undo.
* The [API Reference](/api) lists every operation with examples you can run in the playground.
