"use client";

import { Check, Download, FlaskConical, Loader2, RotateCcw, ShieldCheck, ShieldX, X } from "lucide-react";
import { useState } from "react";
import { TAMPERS, availableTampers, ed25519Supported, tamper, verifyEvidence, type Evidence, type Report, type Tamper } from "@/lib/verify";
import { PillButton, cx } from "./ui";

type Run = { report: Report; tampered: Tamper | null; sigSupported: boolean };

/**
 * Verify it yourself. Downloads the order's raw evidence once, then re-checks every hash link and the shopper's
 * Ed25519 signatures with the viewer's own WebCrypto (lib/verify.ts). The tamper buttons change a local copy the way
 * someone rewriting history would, and show exactly where the check catches it. Nothing is sent back to the server.
 */
export function VerifyPanel({ orderId, label }: { orderId: string; label: (type: string) => string }) {
  const [original, setOriginal] = useState<Evidence | null>(null);
  const [run, setRun] = useState<Run | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function check(kind: Tamper | null) {
    setBusy(true);
    setError(null);
    try {
      let ev = original;
      if (!ev) {
        const res = await fetch(`/api/orders/${orderId}/evidence`, { cache: "no-store" });
        if (!res.ok) throw new Error("The evidence couldn't be downloaded. Try again in a moment.");
        ev = (await res.json()) as Evidence;
        setOriginal(ev);
      }
      const [report, sigSupported] = await Promise.all([verifyEvidence(kind ? tamper(ev, kind) : ev), ed25519Supported()]);
      setRun({ report, tampered: kind, sigSupported });
    } catch (err) {
      setError(err instanceof Error ? err.message : "The check didn't complete.");
    } finally {
      setBusy(false);
    }
  }

  const r = run?.report;
  const sigs = run?.sigSupported ? (r?.signatures ?? []) : [];
  const allGood = Boolean(r && r.brokenAt === -1 && sigs.every((s) => s.ok));
  const broken = r && r.brokenAt !== -1 ? r.steps[r.brokenAt] : null;

  return (
    <section className="on-deep rounded-card bg-deep p-[27px] text-paper sm:p-8" aria-labelledby="verify-title">
      <h2 id="verify-title" className="heading-type text-heading-sm">Verify it yourself</h2>
      <p className="mt-2 text-body-sm text-paper/80">
        Don’t take Undo’s word for it. Your browser downloads the raw history and re-checks every hash and signature with
        its own cryptography.
      </p>

      {!run && (
        <PillButton tone="lime" className="mt-6 w-full sm:w-auto" onClick={() => check(null)} disabled={busy} aria-busy={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <ShieldCheck className="size-4" aria-hidden />}
          {busy ? "Checking…" : "Verify in my browser"}
        </PillButton>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-[16px] bg-bad-bg p-3 text-body-sm text-bad">
          {error}
        </p>
      )}

      {run && r && (
        <div className="mt-6 space-y-5">
          {/* The verdict on the history, in plain words */}
          <div aria-live="polite" className={cx("rounded-[20px] px-4 py-3.5", allGood ? "bg-field text-deep" : "bg-bad-bg text-bad")}>
            <p className="flex items-start gap-2.5 text-body font-medium">
              {allGood ? <ShieldCheck className="mt-0.5 size-5 shrink-0" aria-hidden /> : <ShieldX className="mt-0.5 size-5 shrink-0" aria-hidden />}
              <span>
                {allGood
                  ? `All ${r.steps.length} links${sigs.length ? ` and ${sigs.length} signature${sigs.length === 1 ? "" : "s"}` : ""} check out.`
                  : broken
                    ? `${run.tampered ? "Caught. " : ""}Broken at step ${broken.seq} (${label(broken.type)}): ${
                        broken.problem === "hash" ? "its contents no longer match its hash" : "it no longer points at the step before it"
                      }. Nothing after it can be trusted.`
                    : `${run.tampered ? "Caught. " : ""}The history is intact, but a signature fails. ${sigs.find((s) => !s.ok)?.detail ?? ""}`}
              </span>
            </p>
          </div>

          {/* One square per step: verified, the first broken one, and everything after it */}
          <ol className="flex flex-wrap gap-1.5" aria-label="Each step of the history">
            {r.steps.map((s, i) => {
              const state = r.brokenAt === -1 || i < r.brokenAt ? "ok" : i === r.brokenAt ? "broken" : "untrusted";
              const words = state === "ok" ? "verified" : state === "broken" ? "broken here" : "can't be trusted";
              return (
                <li
                  key={`${s.seq}-${i}`}
                  title={`Step ${s.seq}: ${label(s.type)} (${words})`}
                  className={cx(
                    "grid size-7 place-items-center rounded-[8px] font-mono text-[11px]",
                    state === "ok" && "bg-field text-deep",
                    state === "broken" && "bg-bad text-paper",
                    state === "untrusted" && "bg-paper/10 text-paper/50 line-through",
                  )}
                >
                  <span aria-hidden>{s.seq}</span>
                  <span className="sr-only">
                    Step {s.seq}, {label(s.type)}: {words}
                  </span>
                </li>
              );
            })}
          </ol>

          {/* The shopper's signatures */}
          <ul className="space-y-2 text-body-sm">
            {run.sigSupported ? (
              r.signatures.map((s) => (
                <li key={`${s.what}-${s.seq}`} className="flex items-start gap-2">
                  {s.ok ? <Check className="mt-0.5 size-4 shrink-0 text-field" aria-hidden /> : <X className="mt-0.5 size-4 shrink-0 text-bad-bg" aria-hidden />}
                  <span className="text-paper/85">
                    <span className="font-medium text-paper">{s.what === "mandate" ? "Mandate signature" : "Undo signature"}: </span>
                    {s.detail}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-paper/70">
                This browser can’t check Ed25519 signatures yet, so only the hashes were checked. Try a current Chrome, Edge, Firefox or
                Safari.
              </li>
            )}
          </ul>
          <p className="font-mono text-caption text-paper/60">
            Checked in {r.ms} ms by your browser’s WebCrypto: SHA-256 for each link, Ed25519 for each signature.
          </p>

          {/* Try to cheat: a local copy is changed, then checked again */}
          <fieldset className="border-t border-paper/15 pt-5">
            <legend className="flex items-center gap-2 text-body font-medium">
              <FlaskConical className="size-4 text-field" aria-hidden /> Now try to cheat
            </legend>
            <p className="mt-1 text-body-sm text-paper/70">Each button edits your local copy only, then runs the same check.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {original &&
                availableTampers(original).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => check(k)}
                    disabled={busy}
                    aria-pressed={run.tampered === k}
                    className={cx(
                      "min-h-11 cursor-pointer rounded-full border px-4 text-body-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50",
                      run.tampered === k ? "border-field bg-field text-deep" : "border-paper/30 text-paper hover:border-paper hover:bg-paper/10",
                    )}
                  >
                    {TAMPERS[k].label}
                  </button>
                ))}
              {run.tampered && (
                <button
                  type="button"
                  onClick={() => check(null)}
                  disabled={busy}
                  className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full px-3 text-body-sm text-paper/80 underline underline-offset-4 hover:text-paper"
                >
                  <RotateCcw className="size-3.5" aria-hidden /> Back to the real history
                </button>
              )}
            </div>
            {run.tampered && <p className="mt-3 text-body-sm text-paper/70">{TAMPERS[run.tampered].what}</p>}
          </fieldset>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-1 border-t border-paper/15 pt-4 text-body-sm">
        <a
          href={`/api/orders/${orderId}/evidence`}
          download={`undo-evidence-${orderId}.json`}
          className="inline-flex min-h-11 w-fit items-center gap-2 text-paper underline underline-offset-4 hover:text-field"
        >
          <Download className="size-4" aria-hidden /> Download the raw evidence (JSON)
        </a>
        <details className="text-paper/80">
          <summary className="flex min-h-11 cursor-pointer items-center text-paper [&::-webkit-details-marker]:hidden">How the check works</summary>
          <ul className="mt-1 space-y-2 break-words font-mono text-caption leading-relaxed text-paper/75">
            <li>hash = sha256(prevHash + canonicalJSON(subjectId, seq, type, payload, createdAt)); the first prevHash is 64 zeros.</li>
            <li>mandate: sha256(canonicalJSON(mandate)) must equal the signed digest, and the shopper’s Ed25519 key must verify &quot;undo-intent-mandate-v1:&lt;digest&gt;&quot;.</li>
            <li>undo: the same key must verify &quot;undo-request-v1:&lt;orderId&gt;:&lt;sha256(reason)&gt;:&lt;photoSha256 or -&gt;:&lt;requestedAt&gt;&quot;.</li>
          </ul>
        </details>
      </div>
    </section>
  );
}
