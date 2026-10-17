/**
 * Shopper's words → structured IntentDraft, using Gemini's free tier through the AI SDK.
 * The draft is only a proposal: the shopper reviews it (answering any mustAsk questions) before signing,
 * and the server re-validates everything when the signed mandate comes back.
 */
import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { IntentDraft } from "./mandate";

const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

const INSTRUCTIONS = `You turn a shopper's request into a purchase mandate for an AI shopping agent.
Rules:
- Only include constraints the shopper actually stated. Never invent a size, color, brand or budget.
- maxPrice is the per-item ceiling: "under $120" → 120. If no budget is stated, set maxPrice to 0 and add a mustAsk question about budget.
- attributes: lowercase keys (size, color, material, width, …), values as the shopper said them ("10", "black").
- category: a plain shopping category such as "running shoes", "hoodie", "wireless earbuds".
- mustAsk: questions the agent must ask before buying when something essential is missing or ambiguous (for shoes and clothing, a missing size). Empty when nothing is missing.
- currency defaults to USD unless the shopper states another.`;

export class ParseError extends Error {}

export async function parseRequest(request: string): Promise<IntentDraft> {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) throw new ParseError("GOOGLE_GENERATIVE_AI_API_KEY missing in .env");
  const { output } = await generateText({
    model: google(MODEL),
    system: INSTRUCTIONS,
    prompt: request,
    output: Output.object({ schema: IntentDraft, name: "intent_mandate" }),
    temperature: 0,
    maxRetries: 2,
  });
  const draft = IntentDraft.parse(output);
  // Belt and braces: a missing budget always becomes a question, whatever the model did.
  if (draft.maxPrice === 0 && !draft.mustAsk.some((q) => /budget|price|spend/i.test(q))) {
    draft.mustAsk.push("What's the most you want to spend?");
  }
  return draft;
}
