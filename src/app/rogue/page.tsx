import type { Metadata } from "next";
import { RogueApp } from "@/components/rogue-app";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/ui";

export const metadata: Metadata = {
  title: "Rogue agents",
  description: "Eight AI agents try to break one signed shopping mandate. Undo's guard decides each, live.",
};

export default function RoguePage() {
  return (
    <>
      <SiteNav />
      <main className="flex-1 bg-bone">
        <RogueApp />
      </main>
      <SiteFooter />
    </>
  );
}
