import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { configuredIntegrationsSchema, type ConfiguredIntegrations } from "./configured-integrations.js";

/** Service health. Never includes secret values. */
export type Health = {
  /** True when every check that ran passed. */
  ok: boolean;
  /** Always undo. */
  service: string;
  /** Deployed commit, or `local`. */
  commit: string;
  /** Which integrations have credentials set. Never the values. */
  configured: ConfiguredIntegrations;
  /** With `deep`, `reachable` or the error. */
  paypal?: string;
  /**
   * With deep: whether a live query worked, how long it took, and the shape of the connection URL
   * (never credentials).
   */
  database?: Record<string, unknown>;
  /** With deep: free-tier budget used so far today and this month. */
  usage?: Record<string, unknown>;
};

export const healthSchema: Schema<Health> = s.object<Health>({
  ok: s.boolean(),
  service: s.string(),
  commit: s.string(),
  configured: configuredIntegrationsSchema,
  paypal: s.optional(s.string()),
  database: s.optional(s.record(s.string(), s.unknown())),
  usage: s.optional(s.record(s.string(), s.unknown())),
});
