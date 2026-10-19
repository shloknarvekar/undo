import { ArrowRight, Hourglass } from "lucide-react";
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
    body: "Real products, re-checked live at your exact size and colour. Anything that breaks the mandate is rejected before checkout.",
    api: "Channel3 · Gemini",
  },
  {
    title: "Money is held, not taken",
    body: "PayPal authorizes the payment and Undo sets an undo window by risk: minutes for a sure thing, hours when something couldn't be verified.",
    api: "PayPal Orders v2 · AUTHORIZE",
  },
  {
    title: "Undo decides who pays",
    body: "Rules first, AI second, a human when it's close. Inside the window it's a free void; after capture it's a refund, a claim or a return.",
    api: "Payments v2 · Disputes v1",
  },
];

/** Hover colours for the hero grid: Rewind and its tints, never the status colours. */
const HERO_TINTS = ["#c6f432", "#d7f86a", "#eefbc9", "#a9d61c", "#ffffff"];

/** Big inline figure for the editorial "why now" paragraph. */
function Figure({ children }: { children: ReactNode }) {
  return <span className="display-type tabular text-[1.35em] leading-none">{children}</span>;
}

export default function Home() {
  return (
    <>
      <SiteNav current="home" />
      <main className="flex-1">
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
          <Container className="grid items-center gap-14 py-20 sm:py-28 lg:grid-cols-2">
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
              <div className="flex flex-wrap gap-3">
                <PillLink href="/shop" tone="white">
                  See it decide <ArrowRight className="arrow size-4" aria-hidden />
                </PillLink>
                <PillLink href="/rogue" tone="field">
                  Watch 8 agents try to break a mandate
                </PillLink>
              </div>
            </div>

            {/* A real verdict from the live sandbox run; evidence lines arrive one by one like the engine's checks */}
            <ScrollTilt>
            <figure className="rounded-card bg-black/30 p-[27px] ring-1 ring-paper/10">
              <figcaption className="flex items-center justify-between gap-3">
                <span className="text-body-sm text-paper/70">Undo request · order 7f3c…</span>
                <span className="inline-flex items-center whitespace-nowrap rounded-tag bg-bad-bg px-2.5 py-1 text-body-sm font-medium text-bad">
                  Agent fault · 1.00
                </span>
              </figcaption>
              <p className="mt-6 heading-type text-heading-sm">Agent bought the wrong colour</p>
              <Reveal as="ul" className="mt-5 space-y-3 text-body-sm text-paper/85">
                <li className="flex gap-3"><span className="font-mono text-field">mandate</span> required black, agent bought grey / red / white</li>
                <li className="flex gap-3"><span className="font-mono text-field">record</span> agent skipped the pre-purchase check</li>
                <li className="flex gap-3"><span className="font-mono text-field">window</span> still open, no money captured yet</li>
              </Reveal>
              <div className="mt-7 flex flex-wrap items-center justify-between gap-3 rounded-[20px] bg-paper/10 px-5 py-4">
                <span className="text-body">Authorization voided</span>
                <span className="font-mono text-body-sm text-paper/70">$0.00 moved · $2.58 fees avoided</span>
              </div>
            </figure>
            </ScrollTilt>
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

        {/* Mist — merchants: the one elevated surface compares the same mistake with and without Undo */}
        <section id="merchants" aria-labelledby="merchants-title" className="section-flow bg-mist">
          <Container className="grid items-center gap-14 py-20 sm:py-28 lg:grid-cols-[1fr_1.1fr]">
            <div className="space-y-6">
              <h2 id="merchants-title" className="display-type text-[48px] leading-none sm:text-heading-lg">
                For merchants: stop eating agent mistakes.
              </h2>
              <p className="max-w-lg text-subheading text-ink/80">
                Every agent order arrives with its signed mandate and a verdict trail. Voids before capture keep PayPal fees
                off your books; agent faults are billed to the agent operator, not you.
              </p>
              <PillLink href="/merchant" tone="ink">
                Open the console <ArrowRight className="arrow size-4" aria-hidden />
              </PillLink>
            </div>
            <ScrollTilt>
            <figure className="on-deep bg-deep p-8 text-paper shadow-lift sm:p-10">
              <figcaption className="text-body text-paper/80">
                One wrong-colour pair of shoes, <span className="font-mono">$59.99</span>, from the live sandbox run.
              </figcaption>
              <div className="mt-8 grid gap-8 sm:grid-cols-2">
                <div>
                  <p className="text-body-sm text-paper/70">Without Undo</p>
                  <p className="mt-2 display-type text-[45px] leading-none tabular text-paper/60 line-through decoration-2">$62.57</p>
                  <p className="mt-3 text-body-sm text-paper/80">
                    Captured, then charged back: the sale plus <span className="font-mono">$2.58</span> in fees, lost by you.
                  </p>
                </div>
                <div>
                  <p className="text-body-sm text-paper/70">With Undo</p>
                  <p className="mt-2 display-type text-[45px] leading-none tabular text-field">$0.00</p>
                  <p className="mt-3 text-body-sm text-paper/80">Voided inside the window. The verdict bills the agent operator, and the event chain proves it.</p>
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
