import { ArrowRight, Fingerprint, Hourglass, Search, Undo2 } from "lucide-react";
import { HeadlineCycle } from "@/components/headline-cycle";
import { HeroToggle } from "@/components/hero-toggle";
import { Badge, Container, PillLink, SiteFooter, SiteNav } from "@/components/ui";

const STEPS = [
  {
    icon: Fingerprint,
    title: "You sign what the agent may buy",
    body: "“Black running shoes, size 10, under $120” becomes a mandate signed on your device. Missing details become questions, never guesses.",
    api: "Ed25519 · hash-chained log",
  },
  {
    icon: Search,
    title: "The agent shops inside the lines",
    body: "Real products, re-checked live at your exact size and colour. Anything that breaks the mandate is rejected before checkout.",
    api: "Channel3 · Gemini",
  },
  {
    icon: Hourglass,
    title: "Money is held, not taken",
    body: "PayPal authorizes the payment and Undo sets an undo window by risk: minutes for a sure thing, hours when something couldn't be verified.",
    api: "PayPal Orders v2 · AUTHORIZE",
  },
  {
    icon: Undo2,
    title: "Undo decides who pays",
    body: "Rules first, AI second, a human when it's close. Inside the window it's a free void; after capture it's a refund, a claim or a return.",
    api: "Payments v2 · Disputes v1",
  },
];

export default function Home() {
  return (
    <>
      <SiteNav current="home" />
      <main className="flex-1">
        {/* Hot field — the promise */}
        <section className="bg-field">
          <Container className="flex flex-col items-center gap-10 py-20 text-center sm:py-28">
            <h1 className="display-type max-w-[1100px] text-[52px] leading-[0.95] sm:text-[88px] lg:text-display">
              Every agent purchase gets an undo.
            </h1>
            <HeroToggle />
            <div className="flex flex-col gap-3 sm:flex-row">
              <PillLink href="/shop" tone="ink">
                Try the live demo <ArrowRight className="size-4" aria-hidden />
              </PillLink>
              <PillLink href="/merchant" tone="ink">
                Open the merchant console
              </PillLink>
            </div>
            <div className="mt-4 inline-flex items-center gap-3 rounded-full bg-ink py-2 pl-2 pr-5 text-paper" aria-label="Example: payment held, 5 hours 59 minutes left to undo">
              <span className="grid size-9 place-items-center rounded-full bg-field text-ink">
                <Hourglass className="size-4" aria-hidden />
              </span>
              <span className="text-body-sm sm:text-body">
                $112.00 held · <span className="font-mono tabular">5:59:41</span> left to undo
              </span>
            </div>
          </Container>
        </section>

        {/* White — why now */}
        <section aria-labelledby="why">
          <Container className="py-20 sm:py-28">
            <h2 id="why" className="heading-type max-w-3xl text-heading sm:text-[46px] sm:leading-[1.1]">
              Agents can already buy. Nobody built how they <span className="bg-field px-1">undo</span>.
            </h2>
            <dl className="mt-14 grid gap-10 sm:grid-cols-3">
              {[
                ["132M", "US adults have already used AI for a retail purchase.", "PYMNTS, 2026"],
                ["24%", "of US online adults trust an agent with routine purchases.", "Forrester, 2026"],
                ["0", "card-network dispute codes for “the agent misunderstood me”.", "Visa & Mastercard, 2026"],
              ].map(([n, label, src]) => (
                <div key={n} className="border-t border-ink pt-6">
                  <dt className="display-type text-[67px] leading-none tabular">{n}</dt>
                  <dd className="mt-4 text-subheading">{label}</dd>
                  <dd className="mt-2 text-body-sm text-muted">{src}</dd>
                </div>
              ))}
            </dl>
          </Container>
        </section>

        {/* Deep field — the four outcomes */}
        <section className="on-deep bg-deep text-paper" aria-labelledby="outcomes">
          <Container className="grid items-center gap-14 py-20 sm:py-28 lg:grid-cols-2">
            <div className="space-y-8">
              <h2 id="outcomes" className="text-subheading text-paper/70">
                One button. Four honest outcomes.
              </h2>
              <HeadlineCycle words={["Void.", "Refund.", "Claim.", "Return."]} />
              <p className="max-w-md text-subheading text-paper/80">
                Undo checks the signed mandate against what was bought and what arrived, then routes the money through the
                matching PayPal rail. It doesn&apos;t take anyone&apos;s word for it — not the shopper&apos;s, not the agent&apos;s.
              </p>
              <PillLink href="/shop" tone="white">
                See it decide <ArrowRight className="size-4" aria-hidden />
              </PillLink>
            </div>

            {/* Frosted app card — a real verdict from the live sandbox run */}
            <figure className="rounded-card bg-black/30 p-[27px] ring-1 ring-paper/10">
              <figcaption className="flex items-center justify-between gap-3">
                <span className="text-body-sm text-paper/70">Undo request · order 7f3c…</span>
                <Badge tone="bad">Agent fault · 1.00</Badge>
              </figcaption>
              <p className="mt-6 heading-type text-heading-sm">Agent bought the wrong colour</p>
              <ul className="mt-5 space-y-3 text-body-sm text-paper/85">
                <li className="flex gap-3"><span className="font-mono text-field">mandate</span> required black — agent bought grey / red / white</li>
                <li className="flex gap-3"><span className="font-mono text-field">record</span> agent skipped the pre-purchase check</li>
                <li className="flex gap-3"><span className="font-mono text-field">window</span> still open — no money captured yet</li>
              </ul>
              <div className="mt-7 flex flex-wrap items-center justify-between gap-3 rounded-[20px] bg-paper/10 px-5 py-4">
                <span className="text-body">Authorization voided</span>
                <span className="font-mono text-body-sm text-paper/70">$0.00 moved · $2.58 fees avoided</span>
              </div>
            </figure>
          </Container>
        </section>

        {/* White — how it works */}
        <section id="how" aria-labelledby="how-title" className="scroll-mt-24">
          <Container className="py-20 sm:py-28">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <h2 id="how-title" className="display-type text-[48px] leading-none sm:text-heading-lg">How it works</h2>
              <p className="max-w-md text-subheading text-muted">Four steps, each one a real API call you can watch in the event log.</p>
            </div>
            <ol className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex flex-col rounded-card border border-ink/15 p-[27px]">
                  <div className="flex items-center justify-between">
                    <span className="grid size-11 place-items-center rounded-full bg-field">
                      <s.icon className="size-5" aria-hidden />
                    </span>
                    <span className="font-mono text-body-sm text-muted">0{i + 1}</span>
                  </div>
                  <h3 className="mt-8 heading-type text-heading-sm">{s.title}</h3>
                  <p className="mt-3 flex-1 text-body text-muted">{s.body}</p>
                  <p className="mt-6 font-mono text-caption uppercase tracking-wide text-ink/70">{s.api}</p>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        {/* Full-bleed band — type as the image */}
        <section aria-label="Ctrl+Z for money" className="overflow-hidden bg-deep">
          {/* Letterforms deliberately crop at both edges, like the reference's type-over-photo band */}
          <p aria-hidden className="display-type select-none whitespace-nowrap py-4 text-center text-[31vw] leading-[0.8] text-field [margin-inline:-6vw]">
            CTRL+Z
          </p>
        </section>

        {/* Mist — merchants, with the page's one elevated surface */}
        <section id="merchants" aria-labelledby="merchants-title" className="scroll-mt-24 bg-mist">
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
                Open the console <ArrowRight className="size-4" aria-hidden />
              </PillLink>
            </div>
            <div className="on-deep bg-deep p-8 text-paper shadow-lift sm:p-10">
              <p className="text-body-sm text-paper/70">From the live sandbox run</p>
              <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-8">
                {[
                  ["$2.58", "fees avoided by voiding before capture"],
                  ["$59.99", "liability shifted to an agent operator"],
                  ["1", "claim settled with a signed evidence pack"],
                  ["4 / 4", "decisions with an intact event chain"],
                ].map(([n, l]) => (
                  <div key={l}>
                    <dt className="display-type text-[45px] leading-none text-field tabular">{n}</dt>
                    <dd className="mt-3 text-body-sm text-paper/80">{l}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Container>
        </section>

        {/* Hot field — close */}
        <section className="bg-field">
          <Container className="flex flex-col items-start justify-between gap-8 py-16 sm:py-20 md:flex-row md:items-center">
            <p className="display-type text-[48px] leading-none sm:text-heading-lg">Undo doesn&apos;t believe anyone.<br />It checks.</p>
            <PillLink href="/shop" tone="ink" className="shrink-0">
              Run the demo in the sandbox
            </PillLink>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
