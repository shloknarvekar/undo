"use client";

import { Check, Loader2, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { DeviceKeyUnsupported, getDeviceKey } from "@/lib/device-key";
import { cx } from "./ui";

type Status = "loading" | "saved" | "none" | "unsupported";

const RETURN_NOTE: Record<string, { text: string; tone: "ok" | "warn" }> = {
  saved: { text: "Your PayPal wallet is saved on this device.", tone: "ok" },
  cancelled: { text: "Saving the wallet was cancelled. You'll approve in PayPal as usual.", tone: "warn" },
  not_approved: { text: "PayPal didn't confirm saving the wallet. You'll approve in PayPal as usual.", tone: "warn" },
  error: { text: "The wallet couldn't be saved just now. You'll approve in PayPal as usual.", tone: "warn" },
};

/** Signs a wallet request with this device's key. Same message format as walletMessage() in lib/wallet.ts. */
async function signed(action: "save" | "forget") {
  const key = await getDeviceKey();
  const requestedAt = new Date().toISOString();
  const signature = await key.sign(`undo-wallet-v1:${action}:${key.publicKey}:${requestedAt}`);
  return { shopperKey: key.publicKey, requestedAt, signature };
}

/**
 * "Let the agent pay without asking me." The shopper's choice goes into the mandate they sign (payWith), and only
 * works with a PayPal wallet saved from this device. Saving it is a one-time PayPal approval; forgetting it deletes
 * it at PayPal. Both are signed by the device key, so nobody else can attach or remove a wallet.
 */
export function AutopayOption({
  checked,
  onCheckedChange,
  onSavedChange,
  returnTo,
  onBeforeSave,
}: {
  checked: boolean;
  onCheckedChange: (on: boolean) => void;
  /** Tells the parent whether a wallet is saved, so it only asks for payWith when it can actually be used. */
  onSavedChange: (saved: boolean) => void;
  returnTo: string;
  /** Called just before leaving for PayPal, so the parent can keep what the shopper was doing. */
  onBeforeSave?: () => void;
}) {
  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState<"save" | "forget" | null>(null);
  const [note, setNote] = useState<{ text: string; tone: "ok" | "warn" } | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const back = url.searchParams.get("wallet");
    if (back) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reads the PayPal return query, only available after hydration
      setNote(RETURN_NOTE[back] ?? null);
      if (back === "saved") onCheckedChange(true);
      url.searchParams.delete("wallet");
      window.history.replaceState(null, "", url.pathname + url.search);
    }
    (async () => {
      try {
        const key = await getDeviceKey();
        const res = await fetch(`/api/wallets?key=${encodeURIComponent(key.publicKey)}`, { cache: "no-store" });
        const saved = res.ok && Boolean((await res.json()).saved);
        setStatus(saved ? "saved" : "none");
        onSavedChange(saved);
      } catch (err) {
        setStatus(err instanceof DeviceKeyUnsupported ? "unsupported" : "none");
        onSavedChange(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once, on arrival
  }, []);

  async function save() {
    setBusy("save");
    setNote(null);
    try {
      const res = await fetch("/api/wallets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...(await signed("save")), returnTo }) });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.approveUrl) throw new Error(body.detail ?? "PayPal couldn't start saving the wallet. Try again.");
      onBeforeSave?.();
      window.location.href = body.approveUrl;
    } catch (err) {
      setNote({ text: err instanceof Error ? err.message : "Something went wrong.", tone: "warn" });
      setBusy(null);
    }
  }

  async function forget() {
    setBusy("forget");
    try {
      const res = await fetch("/api/wallets/forget", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(await signed("forget")) });
      if (!res.ok) throw new Error("The wallet couldn't be forgotten. Try again.");
      setStatus("none");
      onSavedChange(false);
      onCheckedChange(false);
      setNote({ text: "Forgotten. Your wallet was deleted from PayPal's vault for Undo.", tone: "ok" });
    } catch (err) {
      setNote({ text: err instanceof Error ? err.message : "Something went wrong.", tone: "warn" });
    } finally {
      setBusy(null);
    }
  }

  if (status === "unsupported") return null;

  return (
    <div className="rounded-[24px] border border-ink/15 p-5">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          className="mt-1 size-5 shrink-0 accent-ink"
          aria-describedby="autopay-help"
        />
        <span>
          <span className="block text-body font-medium">Let the agent pay without asking me</span>
          <span id="autopay-help" className="mt-1 block text-body-sm text-muted">
            It pays with your saved PayPal wallet as soon as it finds a match. The money is still only held, and you get two extra
            hours to undo for free.
          </span>
        </span>
      </label>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 pl-8 text-body-sm">
        {status === "loading" && (
          <span className="inline-flex items-center gap-2 text-muted">
            <Loader2 className="size-4 animate-spin" aria-hidden /> Checking for a saved wallet…
          </span>
        )}
        {status === "saved" && (
          <>
            <span className="inline-flex items-center gap-2 text-ok">
              <Check className="size-4" aria-hidden /> PayPal wallet saved on this device
            </span>
            <button
              type="button"
              onClick={forget}
              disabled={busy !== null}
              className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 text-muted underline underline-offset-4 hover:text-ink disabled:opacity-50"
            >
              {busy === "forget" && <Loader2 className="size-3.5 animate-spin" aria-hidden />} Forget it
            </button>
          </>
        )}
        {status === "none" && checked && (
          <>
            <button
              type="button"
              onClick={save}
              disabled={busy !== null}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-ink px-5 font-medium transition-colors duration-200 hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy === "save" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Wallet className="size-4" aria-hidden />}
              Save my PayPal wallet (one time)
            </button>
            <span className="text-muted">Until you do, you&apos;ll approve in PayPal as usual.</span>
          </>
        )}
      </div>

      {note && (
        <p role="status" className={cx("mt-3 rounded-[16px] px-4 py-2.5 text-body-sm", note.tone === "ok" ? "bg-ok-bg text-ok" : "bg-warn-bg text-warn")}>
          {note.text}
        </p>
      )}
    </div>
  );
}
