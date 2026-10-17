import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Ban,
  CircleDashed,
  Clock,
  Hourglass,
  Lock,
  PackageOpen,
  RotateCcw,
  Scale,
  ShieldAlert,
  Undo2,
  XCircle,
} from "lucide-react";

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx("mx-auto w-full max-w-[1280px] px-4 sm:px-8", className)}>{children}</div>;
}

/** Pill buttons: outline-only on color fields; one solid black allowed on white. */
type Tone = "ink" | "white" | "solid" | "field";
const PILL: Record<Tone, string> = {
  ink: "border-ink text-ink hover:bg-ink hover:text-paper",
  white: "border-paper text-paper hover:bg-paper hover:text-deep",
  solid: "border-ink bg-ink text-paper hover:bg-deep hover:border-deep",
  field: "border-field text-field hover:bg-field hover:text-deep",
};
const pillBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-[33px] py-[13px] text-body font-medium leading-none transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-current";

export function PillLink({ tone = "ink", className, ...p }: ComponentProps<typeof Link> & { tone?: Tone }) {
  return <Link {...p} className={cx(pillBase, PILL[tone], className)} />;
}

export function PillButton({ tone = "ink", className, ...p }: ComponentProps<"button"> & { tone?: Tone }) {
  return <button type="button" {...p} className={cx(pillBase, PILL[tone], className)} />;
}

export function Logo({ onDeep = false }: { onDeep?: boolean }) {
  return (
    <Link href="/" className="inline-flex min-h-11 items-center gap-2" aria-label="Undo home">
      <span className={cx("grid size-8 place-items-center rounded-full", onDeep ? "bg-field text-deep" : "bg-ink text-field")}>
        <Undo2 className="size-4" strokeWidth={2.75} aria-hidden />
      </span>
      <span className={cx("display-type text-[26px] leading-none", onDeep ? "text-paper" : "text-ink")}>undo</span>
    </Link>
  );
}

export function SiteNav({ current }: { current?: "home" | "shop" | "merchant" }) {
  const link = (href: string, label: string, key: string) => (
    <Link
      href={href}
      aria-current={current === key ? "page" : undefined}
      className={cx("rounded-full px-3 py-2 text-body transition-colors hover:bg-bone", current === key && "font-medium underline underline-offset-8")}
    >
      {label}
    </Link>
  );
  return (
    <header className="sticky top-0 z-40 border-b border-fog/60 bg-paper/95 backdrop-blur">
      <Container className="flex h-[72px] items-center justify-between gap-4 md:h-[88px]">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-2 md:flex">
          {link("/#how", "How it works", "how")}
          {link("/#merchants", "For merchants", "merchants-anchor")}
          {link("/merchant", "Merchant console", "merchant")}
        </nav>
        <div className="flex items-center gap-2">
          {/* Wrapper carries the breakpoint: the pill's own inline-flex would override `hidden`. */}
          <span className="hidden sm:inline-flex">
            <PillLink href="/merchant" tone="ink" className="px-6">
              Console
            </PillLink>
          </span>
          <PillLink href="/shop" tone="solid" className="whitespace-nowrap px-5 sm:px-6">
            Try the demo
          </PillLink>
        </div>
      </Container>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-fog/70 bg-paper">
      <Container className="grid gap-8 py-12 text-body-sm text-muted md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs">The reversal layer for agentic commerce. Built on the PayPal Developer Platform for the PayPal AI Hackathon.</p>
        </div>
        <div>
          <p className="mb-1 font-medium text-ink">Product</p>
          <FooterLink href="/shop">Shopper demo</FooterLink>
          <FooterLink href="/merchant">Merchant console</FooterLink>
          <FooterLink href="/#how">How it works</FooterLink>
        </div>
        <div className="space-y-2">
          <p className="font-medium text-ink">Built with</p>
          <p>PayPal Orders · Payments · Disputes · Webhooks</p>
          <p>Channel3 · Gemini · Neon · Render</p>
        </div>
        <div className="space-y-2">
          <p className="font-medium text-ink">Status</p>
          <p>Sandbox only — no real money moves.</p>
          <FooterLink href="/api/health">System health</FooterLink>
        </div>
      </Container>
    </footer>
  );
}

/** Footer links keep a 44px hit area even though the text is 14px. */
function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <p>
      <Link className="inline-flex min-h-11 items-center hover:text-ink" href={href}>
        {children}
      </Link>
    </p>
  );
}

/** Status is never color-only: every badge carries an icon and a word. */
type BadgeTone = "ok" | "warn" | "bad" | "held" | "neutral";
const BADGE: Record<BadgeTone, string> = {
  ok: "bg-ok-bg text-ok",
  warn: "bg-warn-bg text-warn",
  bad: "bg-bad-bg text-bad",
  held: "bg-held-bg text-held",
  neutral: "bg-neutral-bg text-neutral",
};

export function Badge({ tone, icon, children, className }: { tone: BadgeTone; icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-1.5 whitespace-nowrap rounded-tag px-2.5 py-1 text-body-sm font-medium", BADGE[tone], className)}>
      {icon}
      {children}
    </span>
  );
}

const ic = "size-3.5 shrink-0";
export const ORDER_STATUS: Record<string, { label: string; tone: BadgeTone; icon: ReactNode }> = {
  CHECKOUT_CREATED: { label: "Awaiting approval", tone: "neutral", icon: <CircleDashed className={ic} aria-hidden /> },
  CANCELLED: { label: "Cancelled", tone: "neutral", icon: <Ban className={ic} aria-hidden /> },
  AUTHORIZED: { label: "Held · undo open", tone: "held", icon: <Hourglass className={ic} aria-hidden /> },
  VOIDED: { label: "Voided", tone: "ok", icon: <Undo2 className={ic} aria-hidden /> },
  CAPTURED: { label: "Captured", tone: "neutral", icon: <Lock className={ic} aria-hidden /> },
  REFUNDED: { label: "Refunded", tone: "ok", icon: <RotateCcw className={ic} aria-hidden /> },
  PARTIALLY_REFUNDED: { label: "Partly refunded", tone: "ok", icon: <RotateCcw className={ic} aria-hidden /> },
  CLAIM_OPEN: { label: "Claim open", tone: "warn", icon: <ShieldAlert className={ic} aria-hidden /> },
  RETURN_PENDING: { label: "Return pending", tone: "warn", icon: <PackageOpen className={ic} aria-hidden /> },
  REVIEW: { label: "Needs review", tone: "warn", icon: <Scale className={ic} aria-hidden /> },
  DISPUTED: { label: "Disputed", tone: "bad", icon: <AlertTriangle className={ic} aria-hidden /> },
  FAILED: { label: "Failed", tone: "bad", icon: <XCircle className={ic} aria-hidden /> },
};

export const VERDICT: Record<string, { label: string; tone: BadgeTone; icon: ReactNode; who: string }> = {
  AGENT_FAULT: { label: "Agent fault", tone: "bad", icon: <XCircle className={ic} aria-hidden />, who: "Agent operator pays" },
  MERCHANT_FAULT: { label: "Merchant fault", tone: "warn", icon: <ShieldAlert className={ic} aria-hidden />, who: "Merchant pays" },
  SHOPPER_CHANGED_MIND: { label: "Changed mind", tone: "neutral", icon: <BadgeCheck className={ic} aria-hidden />, who: "Merchant protected" },
  INCONCLUSIVE: { label: "Inconclusive", tone: "warn", icon: <Clock className={ic} aria-hidden />, who: "Human review" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = ORDER_STATUS[status] ?? { label: status, tone: "neutral" as const, icon: null };
  return (
    <Badge tone={s.tone} icon={s.icon}>
      {s.label}
    </Badge>
  );
}

export function VerdictBadge({ verdict }: { verdict: string }) {
  const v = VERDICT[verdict] ?? { label: verdict, tone: "neutral" as const, icon: null };
  return (
    <Badge tone={v.tone} icon={v.icon}>
      {v.label}
    </Badge>
  );
}

export function money(amount: string | number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(Number(amount));
}

export function shortHash(h: string, n = 10) {
  return h.length > n ? `${h.slice(0, n)}…` : h;
}
