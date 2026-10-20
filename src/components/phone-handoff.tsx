"use client";

import { Loader2, RefreshCw, Smartphone, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { dataUrlBytes } from "@/lib/photo";
import { cx } from "./ui";

type Handoff = { token: string; url: string; qrSvg: string; expiresAt: string };
type Photo = { dataUrl: string; bytes: ArrayBuffer; name: string };

const POLL_MS = 2000;

/**
 * "Use my phone's camera": shows a one-time QR code, waits for the phone to send its photo, and attaches it here.
 * The phone only hands over the photo; the undo is still signed by this device's key, over the photo's hash.
 */
export function PhoneHandoff({ orderId, onPhoto }: { orderId: string; onPhoto: (p: Photo) => void }) {
  const [handoff, setHandoff] = useState<Handoff | null>(null);
  const [state, setState] = useState<"idle" | "starting" | "waiting" | "expired" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const stopped = useRef(false);
  // The parent's callback changes on every render; keep the latest without restarting the wait.
  const onPhotoRef = useRef(onPhoto);
  useEffect(() => {
    onPhotoRef.current = onPhoto;
  });

  async function start() {
    setState("starting");
    setMessage(null);
    const res = await fetch(`/api/orders/${orderId}/photo-handoff`, { method: "POST" });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setState("error");
      setMessage(body.detail ?? (body.error === "not_undoable" ? "This purchase can't be undone any more." : "The phone link couldn't be made. Try again."));
      return;
    }
    stopped.current = false;
    setHandoff(body);
    setState("waiting");
  }

  function cancel() {
    stopped.current = true;
    setHandoff(null);
    setState("idle");
  }

  // Wait for the phone: ask every two seconds; the first answer after it arrives carries the photo.
  useEffect(() => {
    if (state !== "waiting" || !handoff) return;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      if (stopped.current) return;
      const res = await fetch(`/api/orders/${orderId}/photo-handoff/${handoff.token}`, { cache: "no-store" }).catch(() => null);
      const body = res ? await res.json().catch(() => ({})) : {};
      if (stopped.current) return;
      if (body.status === "ready" && body.photo?.dataUrl) {
        onPhotoRef.current({ dataUrl: body.photo.dataUrl, bytes: await dataUrlBytes(body.photo.dataUrl), name: "Photo from your phone" });
        setHandoff(null);
        setState("idle");
        return;
      }
      if (res?.status === 410 || Date.parse(handoff.expiresAt) < Date.now()) return setState("expired");
      timer = setTimeout(tick, POLL_MS);
    };
    timer = setTimeout(tick, POLL_MS);
    return () => clearTimeout(timer);
  }, [state, handoff, orderId]);

  if (state === "idle" || state === "starting" || state === "error") {
    return (
      <>
        <button
          type="button"
          onClick={start}
          disabled={state === "starting"}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-ink/25 px-5 text-body-sm transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
          {state === "starting" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Smartphone className="size-4" aria-hidden />}
          Use my phone&apos;s camera
        </button>
        {message && <p role="alert" className="w-full text-body-sm text-bad">{message}</p>}
      </>
    );
  }

  return (
    <div className="w-full rounded-[24px] border border-ink/15 p-4 sm:p-5" aria-live="polite">
      <div className="flex items-start justify-between gap-3">
        <p className="text-body font-medium">{state === "expired" ? "That code expired" : "Scan with your phone's camera"}</p>
        <button type="button" onClick={cancel} className="-mr-2 -mt-2 grid size-11 shrink-0 cursor-pointer place-items-center rounded-full hover:bg-bone" aria-label="Close the phone code">
          <X className="size-4" aria-hidden />
        </button>
      </div>
      <div className="mt-3 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div
          className={cx("size-44 shrink-0 overflow-hidden rounded-[16px] bg-paper ring-1 ring-ink/10 [&>svg]:size-full", state === "expired" && "opacity-25")}
          role="img"
          aria-label="QR code that opens the photo page on your phone"
          // The SVG is generated on our own server by the qrcode library, from our own URL.
          dangerouslySetInnerHTML={{ __html: handoff?.qrSvg ?? "" }}
        />
        <div className="min-w-0 space-y-3 text-body-sm">
          {state === "expired" ? (
            <>
              <p className="text-muted">Codes last 15 minutes, for your safety. Make a new one to keep going.</p>
              <button
                type="button"
                onClick={start}
                className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-ink px-5 font-medium hover:bg-ink hover:text-paper"
              >
                <RefreshCw className="size-4" aria-hidden /> New code
              </button>
            </>
          ) : (
            <>
              <p className="text-ink/85">Take a photo of what arrived and tap send. It appears here by itself.</p>
              <p className="flex items-center gap-2 text-muted">
                <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden /> Waiting for your phone…
              </p>
              <p className="text-muted">Your phone only sends the photo. You still sign the undo here.</p>
              <p className="break-all font-mono text-caption text-muted">{handoff?.url}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
