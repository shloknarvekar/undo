import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { merchantKpisSchema, type MerchantKpis } from "./merchant-kpis.js";
import { merchantOrderSchema, type MerchantOrder } from "./merchant-order.js";

/** The store's agent orders and headline numbers. */
export type MerchantOrders = {
  /** Headline numbers for the store. */
  kpis: MerchantKpis;
  /** Agent orders, newest first. */
  orders: MerchantOrder[];
};

export const merchantOrdersSchema: Schema<MerchantOrders> = s.object<MerchantOrders>({
  kpis: merchantKpisSchema,
  orders: s.array(s.lazy(() => merchantOrderSchema)),
});
