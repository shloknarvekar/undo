import type { Metadata } from "next";
import { Suspense } from "react";
import { PhonePhotoApp } from "@/components/phone-photo-app";

export const metadata: Metadata = { title: "Send a photo", robots: { index: false, follow: false } };

/** Opened from the QR code on the order page: the phone takes a photo of what arrived and hands it to the computer. */
export default function PhonePhotoPage() {
  return (
    <main className="min-h-dvh bg-bone">
      <Suspense>
        <PhonePhotoApp />
      </Suspense>
    </main>
  );
}
