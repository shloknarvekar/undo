import { google } from "@ai-sdk/google";
import { spend } from "./usage";

/**
 * One place for the model choice. A "-latest" alias survives model retirements (gemini-2.5-flash is closed to
 * new keys); lite = fastest with the most generous free-tier quota. Override with GEMINI_MODEL.
 * Every call counts against the free-tier budget (lib/usage.ts) and throws QuotaExceeded once it is used up.
 */
export async function aiModel() {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) throw new AiUnavailable("GOOGLE_GENERATIVE_AI_API_KEY missing in .env");
  await spend("gemini");
  return google(process.env.GEMINI_MODEL ?? "gemini-flash-lite-latest");
}

export class AiUnavailable extends Error {}
