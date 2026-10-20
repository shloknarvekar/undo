import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

/** Which integrations have credentials set. Never the values. */
export type ConfiguredIntegrations = {
  /** PayPal sandbox client id and secret are set. */
  paypal: boolean;
  /** The product catalog key is set. */
  channel3: boolean;
  /** The Postgres connection string is set. */
  database: boolean;
};

export const configuredIntegrationsSchema: Schema<ConfiguredIntegrations> = s.object<ConfiguredIntegrations>({
  paypal: s.boolean(),
  channel3: s.boolean(),
  database: s.boolean(),
});
