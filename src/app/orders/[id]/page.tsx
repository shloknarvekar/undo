import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderApp } from "@/components/order-app";
import { SiteNav } from "@/components/ui";

export const metadata: Metadata = { title: "Your purchase" };

/** The shell prerenders; the order id is read on the client (useParams) and the data is fetched live. */
export default function OrderPage() {
  return (
    <>
      <SiteNav current="shop" />
      <main className="flex-1 bg-bone">
        <Suspense>
          <OrderApp />
        </Suspense>
      </main>
    </>
  );
}
