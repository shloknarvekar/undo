import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { Container, PillLink, SiteFooter } from "@/components/ui";

export const metadata: Metadata = {
  title: "Threat model",
  description: "What can go wrong when AI agents buy things, and exactly what in Undo stops each one.",
};

type Threat = { name: string; scenario: string; stops: string; proof?: { href: string; label: string } };

const REFUND_CASE = "/orders/edd288bc-42d0-41d3-9b87-14915f3ff2c6";
const CLAIM_CASE = "/orders/42f33fa9-072d-49fc-9012-75d9a886576d";

/** Every defence named here is in the code and, where it can be shown, linked to where it happens live. */
const STAGES: { stage: string; threats: Threat[] }[] = [
  {
    stage: "Signing",
    threats: [
      {
        name: "Someone changes the mandate after you sign it",
        scenario: "An agent, or a compromised server, raises the budget from $80 to $800.",
        stops: "Your device signs the exact terms with Ed25519. Any edit changes the digest, so the signature stops verifying and the purchase is refused.",
        proof: { href: "/rogue", label: "Budget Hacker, live" },
      },
      {
        name: "A different agent uses your mandate",
        scenario: "An agent picks up a mandate you signed for someone else's agent.",
        stops: "The agent's name is inside the signed bytes. A mandate signed for a registered agent only works for that operator's key.",
        proof: { href: "/rogue", label: "Impersonator, live" },
      },
      {
        name: "An agent pretends to be a trusted one",
        scenario: "An unknown agent calls itself “Claude” to look legitimate.",
        stops: "Only agents presenting a registered operator key (compared in constant time) count as registered. Every other name is shown to you, and to the store, as unregistered.",
        proof: { href: "/merchant", label: "Agent trust" },
      },
      {
        name: "An old approval is reused",
        scenario: "An agent comes back weeks later with the same mandate.",
        stops: "Mandates expire after 14 days, allow one live purchase at a time, and are marked fulfilled once paid.",
        proof: { href: "/rogue", label: "Late Shopper, live" },
      },
    ],
  },
  {
    stage: "Shopping",
    threats: [
      {
        name: "The agent buys the wrong thing",
        scenario: "Over budget, the wrong size or colour, or three instead of one.",
        stops: "Undo's guard re-reads the product live at the exact variant and checks it against the signed limits before PayPal ever sees a cart. Refusals are logged with the reason.",
        proof: { href: "/rogue", label: "Four rogue agents, live" },
      },
      {
        name: "The agent is tricked by a product page",
        scenario: "A listing hides an instruction telling the agent to buy a pricier item.",
        stops: "The guard never reads the agent's reasoning: the cart still has to fit the mandate. A real AI fooled this way is blocked on price.",
        proof: { href: "/rogue", label: "Hijacked Agent, live" },
      },
      {
        name: "The retailer quietly swaps the variant",
        scenario: "Size M is out of stock, so the store resolves the order to L.",
        stops: "Undo compares the variant the retailer actually resolved with what was asked. Substitutions and details it can't verify are shown, and they lengthen the undo window.",
        proof: { href: "/shop", label: "Try it" },
      },
      {
        name: "An agent skips Undo's checks entirely",
        scenario: "A careless third-party agent buys without asking Undo first.",
        stops: "The money is only authorized, the window is 12 hours longer, and if the agent was at fault its operator pays the shop back through PayPal Payouts.",
        proof: { href: REFUND_CASE, label: "Refund + payout case" },
      },
    ],
  },
  {
    stage: "Paying",
    threats: [
      {
        name: "An agent pays without your say-so",
        scenario: "An agent with access to your saved wallet buys on its own.",
        stops: "Paying with your saved wallet has to be in the mandate you signed; the wallet is tied to the device that saved it; saving and forgetting are signed. Even then the money is only held, with two extra hours to undo.",
        proof: { href: "/shop", label: "See the option" },
      },
      {
        name: "A retry charges twice",
        scenario: "A timeout makes a void, capture or refund run a second time.",
        stops: "Every money call carries a fixed PayPal-Request-Id per order, so PayPal returns the first result instead of moving money again.",
      },
      {
        name: "A forged PayPal notification",
        scenario: "Someone posts a fake webhook to change an order's state.",
        stops: "Every webhook is checked with PayPal's own verify-webhook-signature API before anything trusts it.",
      },
    ],
  },
  {
    stage: "Undoing",
    threats: [
      {
        name: "Someone else presses Undo",
        scenario: "Anyone with the order link tries to reverse the purchase.",
        stops: "An undo must be signed by the same device key that signed the mandate. On any other device the button is disabled, and the server refuses unsigned requests.",
        proof: { href: "/#cases", label: "Open a finished case" },
      },
      {
        name: "A false complaint",
        scenario: "The shopper says the colour is wrong when it isn't.",
        stops: "The complaint is recorded as a claim, not evidence. The verdict rests on the mandate check, the agent's record and the photo check; unclear cases go to a person.",
        proof: { href: CLAIM_CASE, label: "Claim case" },
      },
      {
        name: "A phone-photo link is grabbed",
        scenario: "Someone photographs the QR code on your screen.",
        stops: "Links work once, last 15 minutes and only their hash is stored. The phone can't undo anything; your computer's signature covers the photo's hash.",
      },
    ],
  },
  {
    stage: "The record",
    threats: [
      {
        name: "History is rewritten",
        scenario: "Someone edits a verdict or an amount in the database.",
        stops: "Every step is hashed into the next. Your own browser can re-check the whole chain and every signature, and you can tamper with a copy to watch it break.",
        proof: { href: REFUND_CASE, label: "Verify it yourself" },
      },
    ],
  },
  {
    stage: "The service",
    threats: [
      {
        name: "A known-bad agent keeps shopping",
        scenario: "An agent with a record of mistakes comes back to buy again.",
        stops: "Its trust score comes from its record at this store. The store's rules can block it or give its purchases a longer undo window, applied at checkout.",
        proof: { href: "/merchant", label: "Store rules" },
      },
      {
        name: "Someone drains the free tiers",
        scenario: "Scripts hammer the AI and the catalog until the demo stops working.",
        stops: "Per-visitor limits on every costly endpoint, plus daily and monthly budgets stored in Postgres. When a budget is spent the page says so, and the rogue demo replays its last live run.",
      },
    ],
  },
];

const LIMITS = [
  {
    name: "Lose the browser, lose the key",
    detail: "Your signing key lives in one browser's storage. Clear it, and that mandate can't be undone from another device. Key recovery isn't built.",
  },
  { name: "Merchant actions aren't behind sign-in", detail: "Accepting a claim or changing the store's rules is open in this sandbox demo. A real store would put them behind its own login." },
  {
    name: "The photo check is an AI judgement",
    detail: "It can be wrong. Low confidence goes to a person, and a photo is never the only evidence behind a verdict.",
  },
  {
    name: "You still rely on Undo being up",
    detail: "Undo can't forge your signature or quietly rewrite history, but if the service is down, purchases wait. The money stays held, not taken.",
  },
  { name: "Sandbox only", detail: "PayPal sandbox accounts, no real money, and one shared operator account pays back on behalf of every agent." },
];

const total = STAGES.reduce((n, s) => n + s.threats.length, 0);
const linked = STAGES.reduce((n, s) => n + s.threats.filter((t) => t.proof).length, 0);

export default function SecurityPage() {
  return (
    <>
      <SiteNav />
      <main className="flex-1">
        <section className="on-deep bg-deep text-paper">
          <Container className="grid gap-10 py-16 sm:py-24 lg:grid-cols-[1.4fr_1fr] lg:items-end">
            <div>
              <h1 className="display-type text-[48px] leading-[0.95] sm:text-[80px]">
                What can go wrong, and what <span className="text-field">stops it.</span>
              </h1>
              <p className="mt-6 max-w-xl text-subheading text-paper/80">
                Agents that buy things fail in specific ways. Here is each one in plain words, the exact mechanism in Undo that stops
                it, and where you can watch it happen.
              </p>
            </div>
            <dl className="grid grid-cols-3 gap-6 border-t border-paper/20 pt-6 lg:border-t-0 lg:pt-0">
              {[
                [String(total), "threats"],
                [String(STAGES.length), "stages"],
                [String(linked), "shown live"],
              ].map(([n, label]) => (
                <div key={label} className="flex flex-col-reverse">
                  <dt className="mt-2 text-body-sm text-paper/70">{label}</dt>
                  <dd className="display-type text-[44px] leading-none text-field tabular sm:text-[56px]">{n}</dd>
                </div>
              ))}
            </dl>
          </Container>
        </section>

        <div className="bg-bone">
          <Container className="space-y-14 py-16 sm:py-20">
            {STAGES.map((s, si) => (
              <section key={s.stage} aria-labelledby={`stage-${si}`} className="grid gap-6 lg:grid-cols-[13rem_1fr] lg:gap-10">
                <div className="lg:sticky lg:top-28 lg:self-start">
                  <p className="font-mono text-body-sm text-muted tabular">0{si + 1}</p>
                  <h2 id={`stage-${si}`} className="mt-1 heading-type text-heading-sm sm:text-[30px]">{s.stage}</h2>
                </div>
                <ol className="divide-y divide-ink/10 rounded-card bg-paper px-6 sm:px-8">
                  {s.threats.map((t) => (
                    <li key={t.name} className="grid gap-x-8 gap-y-3 py-6 md:grid-cols-[1fr_1.15fr]">
                      <div>
                        <h3 className="heading-type text-subheading">{t.name}</h3>
                        <p className="mt-1 text-body-sm text-muted">{t.scenario}</p>
                      </div>
                      <div>
                        <p className="text-caption font-medium uppercase tracking-wide text-muted">What stops it</p>
                        <p className="mt-1 text-body text-ink/85">{t.stops}</p>
                        {t.proof && (
                          <Link
                            href={t.proof.href}
                            className="group mt-2 inline-flex min-h-11 items-center gap-1.5 text-body-sm font-medium underline-offset-4 hover:underline"
                          >
                            {t.proof.label}
                            <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
                          </Link>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </Container>
        </div>

        <section aria-labelledby="limits-title" className="bg-paper">
          <Container className="grid gap-10 py-16 sm:py-20 lg:grid-cols-[13rem_1fr] lg:gap-10">
            <h2 id="limits-title" className="heading-type text-heading-sm sm:text-[30px]">What it doesn’t cover yet</h2>
            <ul className="grid gap-x-10 gap-y-8 md:grid-cols-2">
              {LIMITS.map((l) => (
                <li key={l.name} className="border-t-2 border-ink pt-4">
                  <h3 className="heading-type text-subheading">{l.name}</h3>
                  <p className="mt-2 text-body text-muted">{l.detail}</p>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        <section className="bg-field">
          <Container className="flex flex-col items-start justify-between gap-6 py-14 md:flex-row md:items-center">
            <p className="display-type text-[40px] leading-none sm:text-[56px]">Don’t take this page’s word for it.</p>
            <PillLink href="/rogue" tone="ink" className="shrink-0">
              Watch the agents try <ArrowRight className="arrow size-4" aria-hidden />
            </PillLink>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
