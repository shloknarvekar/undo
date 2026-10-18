import type { Metadata } from "next";
import { ShopApp } from "@/components/shop-app";
import { SiteNav } from "@/components/site-nav";

export const metadata: Metadata = { title: "Shop with an agent" };

export default function ShopPage() {
  return (
    <>
      <SiteNav current="shop" />
      <main className="flex-1 bg-bone">
        <ShopApp />
      </main>
    </>
  );
}
