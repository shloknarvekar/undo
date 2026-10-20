import * as s from "../core/validation/index.js";
import type { EnumSchema } from "../core/validation/schema.js";

/** How the catalog reads the query. */
export const SearchMode = {
  Default: "default",
  Agentic: "agentic",
} as const;
export type SearchMode = (typeof SearchMode)[keyof typeof SearchMode] | (string & {});

export const searchModeSchema: EnumSchema<SearchMode> = s.enumOf<SearchMode>(SearchMode);
