import { ArrowRight, BadgeCheck, Bot, CalendarX, Fingerprint, Hourglass, Layers, ShieldX, Tag, UserX } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { HeadlineCycle } from "@/components/headline-cycle";
import { HeroToggle } from "@/components/hero-toggle";
import { CountdownChip, CtrlZBand, HeroGrid, Reveal } from "@/components/motion";
import { SiteNav } from "@/components/site-nav";
import { ScrollTilt } from "@/components/ui/container-scroll-animation";
import { Container, PillLink, SiteFooter } from "@/components/ui";

const STEPS = [
  {
    title: "You sign what the agent may buy",
    body: "“Black running shoes, size 10, under $120” becomes a mandate signed on your device. Missing details become questions, never guesses.",
    api: "Ed25519 · hash-chained log",
  },
  {
    title: "The agent shops inside the lines",
    body: "Undo's own agent, or any AI that connects over MCP. Real products, re-checked live at your exact size and colour; anything outside the mandate is refused before checkout.",
    api: "Channel3 · MCP · Gemini",
  },
  {
    title: "Money is held, not taken",
    body: "PayPal authorizes the payment and Undo sets an undo window by risk: minutes for a sure thing, hours when something couldn't be verified.",
    api: "PayPal Orders v2 · AUTHORIZE",
  },
  {
    title: "Undo decides who pays",
    body: "Rules first, AI second, a human when it's close. Inside the window it's a free void; after capture, a refund, a claim or a return. If the agent was at fault, its operator pays the shop back.",
    api: "Payments v2 · Payouts v1",
  },
];

/** Hover colours for the hero grid: Rewind and its tints, never the status colours. */
const HERO_TINTS = ["#c6f432", "#d7f86a", "#eefbc9", "#a9d61c", "#ffffff"];

/** One real, finished sandbox order per outcome: every claim on this page can be opened and checked. */
const CASES = [
  {
    outcome: "Void",
    id: "0ea67cb5-229a-49fc-b5d6-92a62bfba1dd",
    story: "The agent bought size 10.5, not 10. Undo voided the hold inside the window.",
    money: "$116.97 held · $0.00 moved",
  },
  {
    outcome: "Refund",
    id: "edd288bc-42d0-41d3-9b87-14915f3ff2c6",
    story: "Wrong size, money already captured. Refunded in full; the agent's operator paid the shop back.",
    money: "$116.97 refunded · $116.97 paid out",
  },
  {
    outcome: "Claim",
    id: "42f33fa9-072d-49fc-9012-75d9a886576d",
    story: "A yellow graphic hoodie arrived instead of the black one. The photo check put it on the merchant.",
    money: "$80.00 · merchant at fault",
  },
  {
    outcome: "Return",
    id: "265e5167-e26f-435a-82e2-9e19b51df39f",
    story: "Everyone did their job; the shopper changed their mind. A return, less a restocking fee.",
    money: "$50.99 back of $59.99",
  },
];

/** The rogue-agents demo (lib/rogue.ts): one signed mandate, each cheat and the rule that stopped it. */
const ROGUES: { agent: string; tried: string; rule: string; icon: ReactNode; realAi?: boolean }[] = [
  { agent: "Upsell Bot", tried: "a pricier hoodie, over the $80 limit", rule: "Price ceiling", icon: <Tag className="size-3.5" aria-hidden /> },
  { agent: "Close Enough", tried: "size XL instead of M", rule: "Variant check", icon: <Layers className="size-3.5" aria-hidden /> },
  { agent: "Colour Blind", tried: "grey instead of black", rule: "Variant check", icon: <Layers className="size-3.5" aria-hidden /> },
  { agent: "Bulk Buyer", tried: "three hoodies, not one", rule: "Quantity rule", icon: <Layers className="size-3.5" aria-hidden /> },
  { agent: "Budget Hacker", tried: "editing $80 to $800 after signing", rule: "Ed25519 signature", icon: <Fingerprint className="size-3.5" aria-hidden /> },
  { agent: "Late Shopper", tried: "the same mandate three weeks later", rule: "Mandate expiry", icon: <CalendarX className="size-3.5" aria-hidden /> },
  { agent: "Impersonator", tried: "a mandate signed for another agent", rule: "Agent binding", icon: <UserX className="size-3.5" aria-hidden /> },
  {
    agent: "Hijacked Agent",
    tried: "a pricier hoodie in XL, because a note hidden in the listing told it to",
    rule: "Price ceiling",
    icon: <Tag className="size-3.5" aria-hidden />,
    realAi: true,
  },
];

/** An outside agent's session with Undo's MCP server: the tool calls and Undo's replies, abridged. */
const MCP_EXCHANGE: { who: "shopper" | "agent" | "undo"; tool?: string; text: string; tone?: "bad" | "ok" }[] = [
  { who: "shopper", text: "Use Undo to buy me a black hoodie, size M, under $80." },
  { who: "agent", tool: "undo_request_mandate", text: "Here's your signing link. I can't sign it for you." },
  { who: "shopper", text: "Signed." },
  { who: "agent", tool: "undo_propose_cart", text: "Classic Hoodie, size XL." },
  { who: "undo", text: "Refused: size, the mandate says M. Nothing was charged.", tone: "bad" },
  { who: "agent", tool: "undo_propose_cart", text: "Classic Hoodie, size M." },
  { who: "undo", text: "Accepted: authorize-only PayPal checkout, undo window open.", tone: "ok" },
];

/** Big inline figure for the editorial "why now" paragraph. */
function Figure({ children }: { children: ReactNode }) {
  return <span className="display-type tabular text-[1.35em] leading-none">{children}</span>;
}

export default function Home() {
  return (
    <>
      <SiteNav current="home" />
      {/* clip, not hidden: tilted cards scale past the edge mid-scroll, and sticky columns must keep working */}
      <main className="flex-1 overflow-x-clip">
        {/* Deep field — the promise, over a grid of cells that light up in Rewind tints under the cursor */}
        <section className="on-deep relative overflow-hidden bg-deep text-paper">
          {/* The grid fills the right ~60% of the hero; its edge is an invisible diagonal that fades out (globals.css). */}
          <div aria-hidden className="hero-slash absolute inset-0 z-0">
            <HeroGrid colors={HERO_TINTS} lineColor="rgb(255 255 255 / 0.16)" className="hero-grid-pos" />
          </div>
          {/* The wrapper lets pointer events through to the grid; only the controls take them back */}
          <Container className="pointer-events-none relative z-20 flex flex-col items-center gap-10 py-20 text-center sm:py-28">
            <h1 className="stamp-in display-type max-w-[1100px] text-[52px] leading-[0.95] sm:text-[88px] lg:text-display">
              Every agent purchase gets an <span className="text-field">undo.</span>
            </h1>
            <div className="pointer-events-auto">
              <HeroToggle onDeep />
            </div>
            <div className="pointer-events-auto flex flex-col gap-3 sm:flex-row">
              <PillLink href="/shop" tone="lime">
                Try the live demo <ArrowRight className="arrow size-4" aria-hidden />
              </PillLink>
              <PillLink href="/merchant" tone="white">
                Open the merchant console
              </PillLink>
            </div>
            <p className="mt-4 inline-flex items-center gap-3 rounded-full bg-paper py-2 pl-2 pr-5 text-ink">
              <span className="grid size-9 place-items-center rounded-full bg-field text-ink">
                <Hourglass className="size-4" aria-hidden />
              </span>
              <span className="text-body-sm sm:text-body">
                <span className="sr-only">Example: </span>$112.00 held · <CountdownChip />
                <span className="sr-only">about six hours</span> left to undo
              </span>
            </p>
          </Container>
        </section>

        {/* White — why now, as an argument rather than a stat grid */}
        <section aria-labelledby="why" className="section-flow bg-paper">
          <Container className="grid gap-10 py-20 sm:py-28 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
            <h2 id="why" className="heading-type text-heading sm:text-[46px] sm:leading-[1.1]">
              Agents can already buy. Nobody built how they <span className="bg-field px-1">undo</span>.
            </h2>
            <div className="space-y-6 text-subheading text-ink/85 sm:text-heading-sm sm:leading-[1.45]">
              <p>
                <Figure>132M</Figure> US adults have already let AI make a retail purchase, yet only <Figure>24%</Figure> trust an
                agent with routine buying. The gap isn&apos;t the checkout. It&apos;s what happens when the agent gets it wrong.
              </p>
              <p>
                Card networks have <Figure>0</Figure> dispute codes for &ldquo;the agent misunderstood me&rdquo;, so the mistake
                lands on whoever is easiest to charge: usually the merchant.
              </p>
              <p className="text-body-sm text-muted">Sources: PYMNTS 2026; Forrester 2026; Visa and Mastercard reason-code lists, 2026.</p>
            </div>
          </Container>
        </section>

        {/* Deep field — the four outcomes */}
        <section className="section-flow on-deep bg-deep text-paper">
          <Container className="grid items-center gap-14 pb-16 pt-20 sm:pb-20 sm:pt-28 lg:grid-cols-2">
            <div className="space-y-8">
              <HeadlineCycle
                id="outcomes"
                label="One button, four honest outcomes: void, refund, claim, return."
                words={["Void.", "Refund.", "Claim.", "Return."]}
              />
              <p className="max-w-md text-subheading text-paper/80">
                Undo checks the signed mandate against what was bought and what arrived, then routes the money through the
                matching PayPal rail. It doesn&apos;t take anyone&apos;s word for it: not the shopper&apos;s, not the agent&apos;s.
              </p>
              <PillLink href="/shop" tone="white">
                See it decide <ArrowRight className="arrow size-4" aria-hidden />
              </PillLink>
            </div>

            {/* A real verdict from the live sandbox run; evidence lines arrive one by one like the engine's checks */}
            <ScrollTilt>
            <figure className="rounded-card bg-black/30 p-[27px] ring-1 ring-paper/10">
              <figcaption className="flex items-center justify-between gap-3">
                <span className="text-body-sm text-paper/70">Undo request · order 0ea67cb5</span>
                <span className="inline-flex items-center whitespace-nowrap rounded-tag bg-bad-bg px-2.5 py-1 text-body-sm font-medium text-bad">
                  Agent fault · 1.00
                </span>
              </figcaption>
              <p className="mt-6 heading-type text-heading-sm">Agent bought the wrong size</p>
              <Reveal as="ul" className="mt-5 space-y-3 text-body-sm text-paper/85">
                <li className="flex gap-3"><span className="font-mono text-field">mandate</span> required size 10, agent bought 10.5</li>
                <li className="flex gap-3"><span className="font-mono text-field">record</span> agent skipped the pre-purchase check</li>
                <li className="flex gap-3"><span className="font-mono text-field">window</span> still open, no money captured yet</li>
              </Reveal>
              <div className="mt-7 flex flex-wrap items-center justify-between gap-3 rounded-[20px] bg-paper/10 px-5 py-4">
                <span className="text-body">Authorization voided</span>
                <span className="font-mono text-body-sm text-paper/70">$0.00 moved · $4.57 fees avoided</span>
              </div>
            </figure>
            </ScrollTilt>
          </Container>

          {/* Proof, not promises: one finished sandbox order per outcome, each opening its full event chain */}
          <Container className="pb-24 sm:pb-32">
            <div id="cases" className="flex flex-col justify-between gap-2 border-t border-paper/15 pt-8 sm:flex-row sm:items-baseline">
              <h3 id="cases-title" className="heading-type text-heading-sm">Four finished cases. Open any of them.</h3>
              <p className="text-body-sm text-paper/70">Real sandbox orders, with every step&apos;s proof.</p>
            </div>
            <ul aria-labelledby="cases-title" className="mt-6 grid gap-px overflow-hidden rounded-card bg-paper/15 sm:grid-cols-2 xl:grid-cols-4">
              {CASES.map((c) => (
                <li key={c.id} className="flex">
                  <Link
                    href={`/orders/${c.id}`}
                    className="group flex w-full flex-col gap-4 bg-deep p-6 transition-colors duration-200 hover:bg-deep-2 focus-visible:bg-deep-2 sm:p-7"
                  >
                    <span className="display-type text-[40px] leading-none text-field">{c.outcome}.</span>
                    <span className="text-body text-paper/85">{c.story}</span>
                    <span className="mt-auto flex items-end justify-between gap-3 pt-2">
                      <span className="font-mono text-caption text-paper/60">{c.money}</span>
                      <span className="inline-flex shrink-0 items-center gap-1.5 text-body-sm font-medium">
                        Open <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
                        <span className="sr-only">the {c.outcome.toLowerCase()} case</span>
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        {/* White — how it works: a sequence, so a stepper whose track fills as you scroll through it */}
        <section id="how" aria-labelledby="how-title" className="section-flow bg-paper">
          <Container className="py-20 sm:py-28">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <h2 id="how-title" className="display-type text-[48px] leading-none sm:text-heading-lg">How it works</h2>
              <p className="max-w-md text-subheading text-muted">Four steps, each one a real API call you can watch in the event log.</p>
            </div>
            <div className="relative mt-14">
              <div aria-hidden className="absolute inset-x-0 top-[21px] hidden h-[3px] bg-ink/10 xl:block">
                <div className="track-fill h-full bg-ink" />
              </div>
              <ol className="grid gap-12 md:grid-cols-2 md:gap-x-10 xl:grid-cols-4">
                {STEPS.map((s, i) => (
                  <li key={s.title} className="group relative">
                    <span className="relative grid size-11 place-items-center rounded-full border-[3px] border-ink bg-paper font-mono text-body font-medium transition-colors duration-200 group-hover:bg-field">
                      {i + 1}
                    </span>
                    <h3 className="mt-6 heading-type text-heading-sm">{s.title}</h3>
                    <p className="mt-3 text-body text-muted">{s.body}</p>
                    <p className="mt-5 font-mono text-body-sm text-ink/70">{s.api}</p>
                  </li>
                ))}
              </ol>
            </div>
          </Container>
        </section>

        {/* Full-bleed band — type as the image, running right to left on a loop */}
        <CtrlZBand />

        {/* Bone — rogue agents: the guard as a ledger of cheats and the rule that stopped each */}
        <section aria-labelledby="rogue-title" className="section-flow bg-bone">
          <Container className="grid gap-12 py-20 sm:py-28 lg:grid-cols-[1fr_1.25fr] lg:gap-16">
            <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">
              <h2 id="rogue-title" className="display-type text-[48px] leading-none sm:text-heading-lg">
                Eight ways an agent goes rogue. Not one gets through.
              </h2>
              <p className="max-w-md text-subheading text-ink/80">
                One shopper signs &ldquo;a black hoodie, size M, under $80&rdquo;. Nine agents try to use it on live products, one of them a real AI hijacked by a note hidden in a listing.
                Undo&apos;s guard decides each one before PayPal ever sees a cart.
              </p>
              <PillLink href="/rogue" tone="solid">
                Run it live <ArrowRight className="arrow size-4" aria-hidden />
              </PillLink>
            </div>
            <Reveal as="ol" className="divide-y divide-ink/10 rounded-card bg-paper px-6 sm:px-8">
              {ROGUES.map((r) => (
                <li key={r.agent} className="flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                  <p className="min-w-0">
                    <span className="heading-type text-subheading">{r.agent}</span>
                    {r.realAi && (
                      <span className="ml-2 inline-flex translate-y-[-2px] items-center gap-1 rounded-tag bg-warn-bg px-2 py-0.5 align-middle text-caption font-medium text-warn">
                        <Bot className="size-3" aria-hidden /> Real AI
                      </span>
                    )}
                    <span className="block text-body-sm text-muted">tried {r.tried}</span>
                  </p>
                  <span className="flex shrink-0 flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-tag bg-bad-bg px-2.5 py-1 text-body-sm font-medium text-bad">
                      <ShieldX className="size-3.5" aria-hidden /> Blocked
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-tag bg-neutral-bg px-2.5 py-1 text-body-sm font-medium text-neutral">
                      {r.icon} {r.rule}
                    </span>
                  </span>
                </li>
              ))}
              <li className="flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                <p className="min-w-0">
                  <span className="heading-type text-subheading">Careful Claude</span>
                  <span className="block text-body-sm text-muted">bought exactly what was signed</span>
                </p>
                <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-tag bg-ok-bg px-2.5 py-1 text-body-sm font-medium text-ok sm:self-auto">
                  <BadgeCheck className="size-3.5" aria-hidden /> Allowed
                </span>
              </li>
            </Reveal>
          </Container>
        </section>

        {/* Deep field — any AI agent can plug in: Undo as an MCP server */}
        <section id="agents" aria-labelledby="agents-title" className="section-flow on-deep bg-deep text-paper">
          <Container className="grid items-center gap-14 py-20 sm:py-28 lg:grid-cols-[1fr_1.1fr]">
            <div className="min-w-0 space-y-6">
              <h2 id="agents-title" className="display-type text-[48px] leading-none sm:text-heading-lg">
                Any AI agent can shop through Undo.
              </h2>
              <p className="max-w-lg text-subheading text-paper/80">
                Undo is an MCP server. Claude, Cursor or your own agent connects to one address and gets six tools to ask for a
                mandate, search, check a cart and buy, inside the lines the shopper signed.
              </p>
              <p className="w-fit max-w-full break-all rounded-[16px] bg-black/30 px-4 py-3 font-mono text-body-sm text-field ring-1 ring-paper/10">
                https://undo-1c56.onrender.com/api/mcp
              </p>
              <ul className="space-y-3 text-body text-paper/85">
                <li className="flex gap-3"><Fingerprint className="mt-1 size-4 shrink-0 text-field" aria-hidden /> The agent never holds the shopper&apos;s key. Only their device can sign or undo.</li>
                <li className="flex gap-3"><ShieldX className="mt-1 size-4 shrink-0 text-field" aria-hidden /> Every cart goes through the guard. A wrong one is refused, with the reason.</li>
                <li className="flex gap-3"><BadgeCheck className="mt-1 size-4 shrink-0 text-field" aria-hidden /> The mandate names the agent, so its mistakes are billed to its operator.</li>
              </ul>
            </div>
            <ScrollTilt>
              <figure className="rounded-card bg-black/30 p-[27px] ring-1 ring-paper/10">
                <figcaption className="text-body-sm text-paper/70">An agent shopping through Undo&apos;s MCP tools (abridged)</figcaption>
                <ol className="mt-5 space-y-3">
                  {MCP_EXCHANGE.map((m, i) => (
                    <li key={i} className={m.who === "shopper" ? "flex justify-end" : "flex"}>
                      <p
                        className={
                          m.who === "shopper"
                            ? "max-w-[85%] rounded-[18px] rounded-br-[6px] bg-paper px-4 py-2.5 text-body-sm text-ink"
                            : m.who === "agent"
                              ? "max-w-[90%] rounded-[18px] rounded-bl-[6px] bg-paper/10 px-4 py-2.5 text-body-sm"
                              : `max-w-[90%] rounded-[14px] px-4 py-2.5 font-mono text-caption ${m.tone === "bad" ? "bg-bad-bg text-bad" : "bg-ok-bg text-ok"}`
                        }
                      >
                        {m.tool && <span className="mb-1 block font-mono text-caption text-field">{m.tool}</span>}
                        {m.who === "undo" && <span className="font-medium">Undo · </span>}
                        {m.text}
                      </p>
                    </li>
                  ))}
                </ol>
              </figure>
            </ScrollTilt>
          </Container>
        </section>

        {/* Mist — merchants: the one elevated surface compares the same mistake with and without Undo */}
        <section id="merchants" aria-labelledby="merchants-title" className="section-flow bg-mist">
          <Container className="grid items-center gap-14 py-20 sm:py-28 lg:grid-cols-[1fr_1.1fr]">
            <div className="space-y-6">
              <h2 id="merchants-title" className="display-type text-[48px] leading-none sm:text-heading-lg">
                For merchants: stop eating agent mistakes.
              </h2>
              <p className="max-w-lg text-subheading text-ink/80">
                Every agent order arrives with its signed mandate and a verdict trail. Voids before capture keep PayPal fees
                off your books. When an agent was at fault, its operator pays you back through PayPal Payouts, automatically.
              </p>
              <PillLink href="/merchant" tone="ink">
                Open the console <ArrowRight className="arrow size-4" aria-hidden />
              </PillLink>
            </div>
            <ScrollTilt>
            <figure className="on-deep bg-deep p-8 text-paper shadow-lift sm:p-10">
              <figcaption className="text-body text-paper/80">
                A careless agent bought the wrong size, <span className="font-mono">$116.97</span>, and the money was captured
                before anyone noticed. From the live sandbox run.
              </figcaption>
              <div className="mt-8 grid gap-8 sm:grid-cols-2">
                <div>
                  <p className="text-body-sm text-paper/70">Without Undo</p>
                  <p className="mt-2 display-type text-[45px] leading-none tabular text-paper/60 line-through decoration-2">$121.54</p>
                  <p className="mt-3 text-body-sm text-paper/80">
                    Captured, then charged back: the sale plus <span className="font-mono">$4.57</span> in fees, lost by you.
                  </p>
                </div>
                <div>
                  <p className="text-body-sm text-paper/70">With Undo</p>
                  <p className="mt-2 display-type text-[45px] leading-none tabular text-field">$0.00</p>
                  <p className="mt-3 text-body-sm text-paper/80">The shopper was refunded in full, then the agent&apos;s operator paid you back $116.97 through PayPal Payouts.</p>
                  <p className="mt-3 break-all font-mono text-caption text-paper/60">Payouts transaction 3JU78306XG5327728</p>
                </div>
              </div>
            </figure>
            </ScrollTilt>
          </Container>
        </section>

        {/* Hot field — close */}
        <section className="section-flow bg-field">
          <Container className="flex flex-col items-start justify-between gap-8 py-16 sm:py-20 md:flex-row md:items-center">
            <p className="display-type text-[48px] leading-none sm:text-heading-lg">Undo doesn&apos;t believe anyone.<br />It checks.</p>
            <PillLink href="/shop" tone="ink" className="shrink-0">
              Run the demo in the sandbox <ArrowRight className="arrow size-4" aria-hidden />
            </PillLink>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
