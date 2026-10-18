import type { Metadata } from "next";
import { Suspense } from "react";
import { SignApp } from "@/components/sign-app";
import { SiteNav } from "@/components/site-nav";

export const metadata: Metadata = { title: "Sign a mandate" };

/** Where an outside agent sends the shopper to sign. The shell prerenders; the request is fetched on the client. */
export default function SignMandatePage() {
  return (
    <>
      <SiteNav />
      <main className="flex-1 bg-bone">
        <Suspense>
          <SignApp />
        </Suspense>
      </main>
    </>
  );
}
