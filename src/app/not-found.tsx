import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { Container, PillLink, SiteFooter } from "@/components/ui";

export const metadata: Metadata = { title: "Page not found" };

const PLACES = [
  { href: "/#cases", label: "Four finished cases", note: "void, refund, claim, return" },
  { href: "/rogue", label: "Rogue agents", note: "eight cheats, one real AI" },
  { href: "/merchant", label: "Merchant console", note: "every agent order, live" },
  { href: "/#agents", label: "Connect your own agent", note: "Undo over MCP" },
];

/** Every unknown address. The line is the product's own: there's nothing here to undo, so here's where things are. */
export default function NotFound() {
  return (
    <>
      <SiteNav />
      <main className="on-deep flex flex-1 items-center bg-deep text-paper">
        <Container className="grid gap-12 py-20 sm:py-28 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div>
            <p className="font-mono text-body-sm text-paper/70">404 · page not found</p>
            <h1 className="mt-5 display-type text-[52px] leading-[0.95] sm:text-[88px]">
              Nothing here to <span className="text-field">undo.</span>
            </h1>
            <p className="mt-6 max-w-lg text-subheading text-paper/80">
              This address doesn’t exist, or the link was cut short. Everything Undo does is one click away.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <PillLink href="/" tone="lime">
                Back to the start <ArrowRight className="arrow size-4" aria-hidden />
              </PillLink>
              <PillLink href="/shop" tone="white">
                Try the live demo
              </PillLink>
            </div>
          </div>
          <nav aria-label="Where to go" className="rounded-card bg-black/30 p-[27px] ring-1 ring-paper/10">
            <p className="text-body-sm text-paper/70">Or go straight to</p>
            <ul className="mt-3 divide-y divide-paper/10">
              {PLACES.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="group flex min-h-11 items-center justify-between gap-4 rounded-[16px] px-3 py-3.5 transition-colors duration-200 hover:bg-paper/10"
                  >
                    <span>
                      <span className="block text-body font-medium">{l.label}</span>
                      <span className="block text-body-sm text-paper/60">{l.note}</span>
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-field transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
