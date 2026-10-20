import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

/** The agent a mandate authorizes. Inside the signed bytes, so liability follows the name. */
export type AgentRef = {
  /** The agent's name as it introduced itself. */
  name: string;
  /** The agent presented a registered operator key. */
  verified: boolean;
};

export const agentRefSchema: Schema<AgentRef> = s.object<AgentRef>({
  name: s.string(),
  verified: s.boolean(),
});
