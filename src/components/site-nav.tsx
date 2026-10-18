"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Container, Logo, PillLink, cx } from "./ui";

/**
 * Sticky nav. One entry per destination: section anchors as text links, the two apps as pills
 * (the old "Merchant console" link + "Console" pill pointed at the same page — removed).
 * Past the hero it compresses (88 → 64px) and gains a hairline, so the page keeps more room while reading.
 */
export function SiteNav({ current }: { current?: "home" | "shop" | "merchant" }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const anchor = (href: string, label: string) => (
    <Link href={href} className="band-hover rounded-[2px] px-1 py-2 text-body">
      {label}
    </Link>
  );

  return (
    <header
      className={cx(
        "sticky top-0 z-40 bg-paper/95 backdrop-blur transition-[border-color,box-shadow] duration-300",
        scrolled ? "border-b border-ink/10" : "border-b border-transparent",
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
          {anchor("/#merchants", "For merchants")}
        </nav>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex">
            <PillLink href="/merchant" tone="ink" className="px-6" aria-current={current === "merchant" ? "page" : undefined}>
              Merchant console
            </PillLink>
          </span>
          <PillLink href="/shop" tone="solid" className="whitespace-nowrap px-5 sm:px-6" aria-current={current === "shop" ? "page" : undefined}>
            Try the demo
          </PillLink>
        </div>
      </Container>
    </header>
  );
}
