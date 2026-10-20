import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { chainEventSchema, type ChainEvent } from "./chain-event.js";

/** The mandate's event chain, with a proof on every step. */
export type EventChain = {
  /** Every hash links correctly. */
  intact: boolean;
  /** Events, oldest first. */
  events: ChainEvent[];
};

export const eventChainSchema: Schema<EventChain> = s.object<EventChain>({
  intact: s.boolean(),
  events: s.array(s.lazy(() => chainEventSchema)),
});
