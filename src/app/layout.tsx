import type { Metadata, Viewport } from "next";
import { DM_Sans, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Inter_Tight({ variable: "--font-inter-tight", subsets: ["latin"], weight: ["700", "900"] });
const sans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"], weight: ["400", "500"] });
const mono = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  title: { default: "Undo — Ctrl+Z for AI agent purchases", template: "%s · Undo" },
  description:
    "Undo gives every AI agent purchase a signed mandate, a risk-based undo window and an evidence-backed reversal through PayPal.",
};

export const viewport: Viewport = { themeColor: "#c6f432", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="min-h-dvh flex flex-col">{children}</body>
    </html>
  );
}
