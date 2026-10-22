"use client";

import { Camera, Check, Loader2, MonitorSmartphone, RotateCcw, Send } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { preparePhoto } from "@/lib/photo";
import { Logo, PillButton } from "./ui";

type Product = { title: string; imageUrl: string | null; variant: Record<string, string> };

const ERRORS: Record<string, string> = {
  expired: "This code has expired. Make a new one on your computer and scan it again.",
  already_sent: "A photo was already sent with this code. Make a new one on your computer to send another.",
  not_found: "This code isn't valid. Scan the code on your computer again.",
  photo_too_large: "That photo is too large. Try again; it will be made smaller first.",
  bad_photo: "That file isn't a photo Undo can read. Try taking it again.",
};

/**
 * The phone's half of the photo handoff: take a photo of what arrived and send it to the order page on the computer.
 * The phone signs nothing; the shopper still signs the undo on their computer, over this photo's hash.
 */
export function PhonePhotoApp() {
  const { id } = useParams<{ id: string }>();
  const token = useSearchParams().get("t") ?? "";
  const [product, setProduct] = useState<Product | null>(null);
  const [photo, setPhoto] = useState<{ dataUrl: string } | null>(null);
  const [state, setState] = useState<"ready" | "preparing" | "sending" | "sent">("ready");
  const [error, setError] = useState<string | null>(token ? null : ERRORS.not_found);
  // A link that can't take a photo any more (wrong, expired or already used) says so before the camera opens.
  const [closed, setClosed] = useState(!token);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/orders/${id}/photo-handoff/${encodeURIComponent(token)}?check=1`, { cache: "no-store" })
      .then(async (r) => {
        if (r.ok) return;
        const body = await r.json().catch(() => ({}));
        setClosed(true);
        setError(ERRORS[body.error] ?? ERRORS.not_found);
      })
      .catch(() => {});
  }, [id, token]);

  useEffect(() => {
    fetch(`/api/orders/${id}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setProduct({ title: d.order.product.title, imageUrl: d.order.product.imageUrl ?? null, variant: d.order.product.variant ?? {} }))
      .catch(() => {});
  }, [id]);

  async function choose(file: File | undefined) {
    if (!file) return;
    setError(null);
    setState("preparing");
    try {
      setPhoto({ dataUrl: (await preparePhoto(file)).dataUrl });
    } catch {
      setError("That photo couldn't be read. Try taking it again.");
    }
    setState("ready");
  }

  async function send() {
    if (!photo) return;
    setState("sending");
    setError(null);
    const res = await fetch(`/api/orders/${id}/photo-handoff/${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photo: photo.dataUrl }),
    }).catch(() => null);
    const body = res ? await res.json().catch(() => ({})) : {};
    if (res?.ok) return setState("sent");
    setState("ready");
    setError((body.error === "rate_limited" && body.detail) || ERRORS[body.error] || "The photo didn't send. Check your connection and try again.");
  }

  const variant = product ? Object.entries(product.variant).map(([k, v]) => `${k} ${v}`).join(" · ") : "";

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-8 pt-6">
      <Logo />

      {state === "sent" ? (
        <section className="mt-16 flex flex-1 flex-col" aria-live="polite">
          <span className="grid size-16 place-items-center rounded-full bg-field">
            <Check className="size-8 text-deep" aria-hidden />
          </span>
          <h1 className="mt-6 display-type text-[44px] leading-[0.95]">Sent.</h1>
          <p className="mt-4 text-subheading text-ink/80">
            The photo is on your computer now. Finish the undo there: it’s signed by your computer’s key, not this phone.
          </p>
          <p className="mt-6 inline-flex items-center gap-2 text-body-sm text-muted">
            <MonitorSmartphone className="size-4" aria-hidden /> You can close this page.
          </p>
        </section>
      ) : (
        <>
          <h1 className="mt-10 display-type text-[40px] leading-[0.98]">Show Undo what arrived.</h1>
          <p className="mt-3 text-body text-ink/75">Take one clear photo of the item. It goes straight to the purchase open on your computer.</p>

          {product && (
            <div className="mt-6 flex items-center gap-3 rounded-[20px] bg-paper p-3">
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.imageUrl} alt="" className="size-14 shrink-0 rounded-[12px] bg-bone object-contain" />
              ) : (
                <div className="size-14 shrink-0 rounded-[12px] bg-bone" aria-hidden />
              )}
              <div className="min-w-0">
                <p className="text-caption text-muted">What you ordered</p>
                <p className="truncate text-body font-medium">{product.title}</p>
                {variant && <p className="truncate text-body-sm text-muted">{variant}</p>}
              </div>
            </div>
          )}

          {!closed && <input ref={fileRef} id="shot" type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => choose(e.target.files?.[0])} />}

          <div className={closed ? "hidden" : "mt-6 flex flex-1 flex-col"}>
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo.dataUrl} alt="The photo you just took" className="max-h-[46dvh] w-full rounded-[24px] bg-paper object-contain" />
            ) : (
              <label
                htmlFor="shot"
                className="flex min-h-[40dvh] flex-1 cursor-pointer flex-col items-center justify-center gap-3 rounded-[28px] border-2 border-dashed border-ink/25 bg-paper text-center transition-colors active:bg-mist has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink"
              >
                {state === "preparing" ? <Loader2 className="size-9 animate-spin" aria-hidden /> : <Camera className="size-9" aria-hidden />}
                <span className="heading-type text-heading-sm">{state === "preparing" ? "Getting it ready…" : "Take a photo"}</span>
                <span className="text-body-sm text-muted">Opens your camera</span>
              </label>
            )}
          </div>

          {error && (
            <p role="alert" className="mt-4 rounded-[16px] bg-bad-bg p-3 text-body-sm text-bad">
              {error}
            </p>
          )}

          {photo && (
            <div className="mt-6 grid gap-3">
              <PillButton tone="solid" className="w-full" onClick={send} disabled={state === "sending" || !token}>
                {state === "sending" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />}
                {state === "sending" ? "Sending…" : "Send to my computer"}
              </PillButton>
              <PillButton tone="ink" className="w-full" onClick={() => fileRef.current?.click()} disabled={state === "sending"}>
                <RotateCcw className="size-4" aria-hidden /> Take it again
              </PillButton>
            </div>
          )}
        </>
      )}
    </div>
  );
}
