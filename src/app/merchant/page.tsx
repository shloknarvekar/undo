import type { Metadata } from "next";
import { MerchantConsole } from "@/components/merchant-console";
import { SiteNav } from "@/components/ui";

export const metadata: Metadata = { title: "Merchant console" };

export default function MerchantPage() {
  return (
    <>
      <SiteNav current="merchant" />
      <main className="flex-1 bg-bone">
        <MerchantConsole />
      </main>
    </>
  );
}
