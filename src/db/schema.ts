import { index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

/** Signed intent mandates. `mandate` is the exact signed JSON; `digest` is sha256 of its canonical form. */
export const mandates = pgTable(
  "mandates",
  {
    id: uuid("id").primaryKey(),
    shopperKey: text("shopper_key").notNull(),
    mandate: jsonb("mandate").notNull(),
    digest: text("digest").notNull(),
    signature: text("signature").notNull(),
    status: text("status", { enum: ["ACTIVE", "FULFILLED", "REVOKED", "EXPIRED"] }).notNull().default("ACTIVE"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("mandates_shopper_idx").on(t.shopperKey)],
);

/**
 * A purchase the agent made under a mandate. Money moves only through PayPal; this row tracks where it stands.
 * CHECKOUT_CREATED → (shopper approves in PayPal) → AUTHORIZED (undo window open) → CAPTURED | VOIDED → REFUNDED…
 */
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey(),
    mandateId: uuid("mandate_id")
      .notNull()
      .references(() => mandates.id),
    status: text("status", {
      enum: ["CHECKOUT_CREATED", "CANCELLED", "AUTHORIZED", "VOIDED", "CAPTURED", "REFUNDED", "DISPUTED", "FAILED"],
    }).notNull(),
    paypalOrderId: text("paypal_order_id").unique(),
    authorizationId: text("authorization_id"),
    captureId: text("capture_id"),
    amount: text("amount").notNull(), // decimal string exactly as sent to PayPal
    currency: text("currency").notNull(),
    quantity: integer("quantity").notNull(),
    product: jsonb("product").notNull(), // StoreProduct snapshot the agent bought (fresh from Channel3 at checkout)
    agent: jsonb("agent").notNull(), // reasoning, confidence, candidates considered, guard result
    risk: jsonb("risk"), // undo-window decision and the factors behind it
    windowEndsAt: timestamp("window_ends_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("orders_mandate_idx").on(t.mandateId), index("orders_status_window_idx").on(t.status, t.windowEndsAt)],
);

/**
 * Append-only, hash-chained event log per subject (a mandate id for now; later orders/disputes hang off it).
 * (subject_id, seq) is unique, so two concurrent appends can't both extend the same link — one fails and retries.
 */
export const events = pgTable(
  "events",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    subjectId: text("subject_id").notNull(),
    seq: integer("seq").notNull(),
    type: text("type").notNull(),
    payload: jsonb("payload").notNull(),
    createdAt: text("created_at").notNull(), // ISO string exactly as hashed
    prevHash: text("prev_hash").notNull(),
    hash: text("hash").notNull(),
  },
  (t) => [uniqueIndex("events_subject_seq_uq").on(t.subjectId, t.seq)],
);
