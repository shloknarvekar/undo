"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Container, Logo, PillLink, cx } from "./ui";

/** Everything the phone menu offers; the desktop bar shows the first three as text links and the console as a pill. */
const MENU: [string, string][] = [
  ["/#how", "How it works"],
  ["/#agents", "For agents"],
  ["/#merchants", "For merchants"],
  ["/rogue", "Rogue agents"],
  ["/security", "Threat model"],
  ["/merchant", "Merchant console"],
  ["/docs", "API docs"],
];

/**
 * Sticky nav. One entry per destination: section anchors as text links, the two apps as pills
 * (the old "Merchant console" link + "Console" pill pointed at the same page — removed).
 * Past the hero it compresses (88 → 64px) and gains a hairline, so the page keeps more room while reading.
 * Below md the links move into a menu sheet, so a phone can still reach every page.
 */
export function SiteNav({ current }: { current?: "home" | "shop" | "merchant" }) {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  const anchor = (href: string, label: string) => (
    <Link href={href} className="band-hover rounded-[2px] px-1 py-2 text-body">
      {label}
    </Link>
  );

  return (
    <header
      className={cx(
        "sticky top-0 z-40 bg-paper/95 backdrop-blur transition-[border-color,box-shadow] duration-300",
        scrolled || menu ? "border-b border-ink/10" : "border-b border-transparent",
      )}
    >
      <Container
        className={cx(
          "flex items-center justify-between gap-4 transition-[height] duration-300 ease-out",
          scrolled ? "h-16" : "h-[72px] md:h-[88px]",
        )}
      >
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
          {anchor("/#how", "How it works")}
          {anchor("/#agents", "For agents")}
          {anchor("/#merchants", "For merchants")}
        </nav>
        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex">
            <PillLink href="/merchant" tone="ink" className="px-6" aria-current={current === "merchant" ? "page" : undefined}>
              Merchant console
            </PillLink>
          </span>
          <PillLink href="/shop" tone="solid" className="whitespace-nowrap px-5 sm:px-6" aria-current={current === "shop" ? "page" : undefined}>
            Try the demo
          </PillLink>
          <button
            type="button"
            onClick={() => setMenu((m) => !m)}
            aria-expanded={menu}
            aria-controls="site-menu"
            aria-label={menu ? "Close menu" : "Open menu"}
            className="grid size-11 cursor-pointer place-items-center rounded-full border border-ink/20 md:hidden"
          >
            {menu ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </Container>
      {menu && (
        <nav id="site-menu" aria-label="Menu" className="border-t border-ink/10 bg-paper md:hidden">
          <Container className="py-3">
            <ul>
              {MENU.map(([href, label]) => (
                <li key={href}>
                  <a href={href} onClick={() => setMenu(false)} className="flex min-h-12 items-center border-b border-ink/10 text-subheading">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </Container>
        </nav>
      )}
    </header>
  );
}
