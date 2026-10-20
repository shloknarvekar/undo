"use client";

import { AllCommunityModule, ModuleRegistry, themeQuartz, type ColDef, type ICellRendererParams } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { AlertTriangle, ExternalLink, FastForward, Loader2, PackageCheck, RefreshCw, Search, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EVENT_LABEL } from "./order-app";
import { useFocusTrap } from "./use-focus-trap";
import { Badge, Container, PillButton, StatusBadge, VERDICT, VerdictBadge, cx, money, shortHash } from "./ui";
import { AgentTrust } from "./agent-trust";

ModuleRegistry.registerModules([AllCommunityModule]);

type Row = {
  id: string;
  createdAt: string;
  status: string;
  amount: number;
  currency: string;
  product: string;
  brand: string | null;
  variant: string;
  imageUrl: string | null;
  retailer: string | null;
  request: string | null;
  agentConfidence: number | null;
  guardBypassed: boolean;
  simulated: string | null;
  agentName: string;
  agentVerified: boolean;
  agentVia: string;
  verdict: string | null;
  verdictConfidence: number | null;
  liability: string | null;
  action: string | null;
  windowMinutesLeft: number | null;
  paypalRef: string | null;
};
type Kpis = { agentOrders: number; undone: number; feesAvoided: number; billedToAgents: number; merchantProtected: number; needsAction: number; heldNow: number };
type Detail = {
  order: { resolution: { decision: { verdict: string; confidence: number; evidence: { source: string; finding: string }[] }; action: { type: string; reason: string }; evidencePack?: { digest: string }; settlement?: { status: string; amount: string; currency: string; from: string; to: string | null; payoutBatchId?: string; transactionId?: string; error?: string } } | null };
  chain: { intact: boolean; events: { seq: number; type: string; hash: string }[] };
};

/** AG Grid themed from the Undo tokens (globals.css @theme): DM Sans, ink text, Rewind Mist hover, 30px radius. */
const gridTheme = themeQuartz.withParams({
  fontFamily: "var(--font-dm-sans), ui-sans-serif, system-ui",
  fontSize: 14,
  headerFontSize: 13,
  headerFontWeight: 500,
  foregroundColor: "var(--color-ink)",
  backgroundColor: "var(--color-paper)",
  headerBackgroundColor: "var(--color-paper)",
  headerTextColor: "var(--color-muted)",
  borderColor: "color-mix(in srgb, var(--color-ink) 8%, transparent)",
  rowHoverColor: "var(--color-mist)",
  selectedRowBackgroundColor: "var(--color-mist)",
  accentColor: "var(--color-deep)",
  wrapperBorderRadius: 30,
  wrapperBorder: false,
  rowHeight: 64,
  headerHeight: 48,
  spacing: 6,
});

const FILTERS = {
  all: { label: "All", test: () => true },
  action: { label: "Needs you", test: (r: Row) => ["CLAIM_OPEN", "RETURN_PENDING", "REVIEW"].includes(r.status) },
  held: { label: "Held · undo open", test: (r: Row) => r.status === "AUTHORIZED" },
  undone: { label: "Undone", test: (r: Row) => Boolean(r.verdict) },
} as const;

const LIABILITY: Record<string, string> = { agent_operator: "Agent operator", merchant: "You (merchant)", shopper: "Shopper — you're protected" };

function ProductCell({ data }: ICellRendererParams<Row>) {
  if (!data) return null;
  return (
    <div className="flex h-full items-center gap-3">
      {data.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={data.imageUrl} alt="" width={40} height={40} className="size-10 shrink-0 rounded-[10px] bg-bone object-contain" loading="lazy" />
      ) : (
        <span className="size-10 shrink-0 rounded-[10px] bg-bone" />
      )}
      <div className="min-w-0 leading-tight">
        <p className="truncate font-medium">{data.product}</p>
        <p className="truncate text-caption text-muted">{[data.variant, data.retailer].filter(Boolean).join(" · ") || "—"}</p>
      </div>
    </div>
  );
}

export function MerchantConsole() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [filter, setFilter] = useState<keyof typeof FILTERS>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Row | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshed, setRefreshed] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/merchant/orders", { cache: "no-store" });
    if (res.ok) {
      const body = await res.json();
      setRows(body.orders);
      setKpis(body.kpis);
      setSelected((s) => (s ? (body.orders as Row[]).find((r) => r.id === s.id) ?? null : null));
    }
    setLoading(false);
    setRefreshed((n) => n + 1);
  }, []);

  useEffect(() => {
    void load();
    // Poll only while the tab is visible; catch up as soon as it comes back.
    const t = setInterval(() => document.visibilityState === "visible" && load(), 15000);
    const onVisible = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  const columns = useMemo<ColDef<Row>[]>(
    () => [
      {
        field: "createdAt",
        headerName: "When",
        width: 150,
        sort: "desc",
        valueFormatter: (p) => new Date(p.value).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      },
      { field: "product", headerName: "Agent order", flex: 2, minWidth: 260, cellRenderer: ProductCell },
      {
        field: "agentName",
        headerName: "Agent",
        width: 190,
        cellRenderer: (p: ICellRendererParams<Row>) =>
          p.data && (
            <span className="flex h-full flex-col justify-center leading-tight">
              <span className="truncate font-medium">{p.data.agentName}</span>
              <span className="text-caption text-muted">{p.data.agentVia === "mcp" ? "via MCP" : "Undo web"} · {p.data.agentVerified ? "registered" : "unregistered"}</span>
            </span>
          ),
      },
      {
        field: "amount",
        headerName: "Amount",
        width: 110,
        type: "rightAligned",
        valueFormatter: (p) => money(p.value, p.data?.currency),
        cellClass: "font-mono tabular",
      },
      { field: "status", headerName: "Status", width: 190, cellRenderer: (p: ICellRendererParams<Row>) => p.value && <StatusBadge status={p.value} /> },
      {
        field: "verdict",
        headerName: "Verdict",
        width: 170,
        cellRenderer: (p: ICellRendererParams<Row>) => (p.value ? <VerdictBadge verdict={p.value} /> : <span className="text-muted">—</span>),
      },
      { field: "liability", headerName: "Who pays", width: 190, valueFormatter: (p) => (p.value ? LIABILITY[p.value] ?? p.value : "—") },
      {
        field: "windowMinutesLeft",
        headerName: "Undo window",
        width: 130,
        valueFormatter: (p) => (p.value == null ? "—" : p.value >= 60 ? `${Math.floor(p.value / 60)}h ${p.value % 60}m left` : `${p.value}m left`),
        cellClass: "font-mono tabular",
      },
      { field: "request", headerName: "Shopper's mandate", flex: 2, minWidth: 240, tooltipField: "request", cellClass: "text-muted" },
    ],
    [],
  );

  const visible = useMemo(() => (rows ?? []).filter(FILTERS[filter].test), [rows, filter]);

  return (
    <>
      <section className="on-deep bg-deep text-paper">
        <Container className="py-10 sm:py-14">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <h1 className="display-type text-[45px] leading-none sm:text-heading-lg">Agent orders</h1>
              <p className="mt-3 text-body text-paper/70">Undo Demo Store, on the PayPal sandbox</p>
            </div>
            <PillButton tone="white" onClick={load} disabled={loading}>
              <RefreshCw className={cx("size-4", loading && "animate-spin")} aria-hidden /> Refresh
            </PillButton>
          </div>
          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-5">
            {[
              ["Agent orders", kpis ? String(kpis.agentOrders) : "—"],
              ["Held right now", kpis ? money(kpis.heldNow) : "—"],
              ["Fees avoided by voids", kpis ? money(kpis.feesAvoided) : "—", "est."],
              ["Billed to agent operators", kpis ? money(kpis.billedToAgents) : "—"],
              ["Need your decision", kpis ? String(kpis.needsAction) : "—"],
            ].map(([label, value, note]) => (
              <div key={label} className="border-t border-paper/20 pt-4">
                <dt className="text-body-sm text-paper/70">{label}{note && <span className="ml-1 text-paper/50">({note})</span>}</dt>
                <dd className="mt-2 display-type text-[32px] leading-none text-field tabular sm:text-[45px]">{value}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <Container className="py-8 sm:py-10">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div role="group" aria-label="Filter orders" className="flex flex-wrap gap-2">
            {(Object.keys(FILTERS) as (keyof typeof FILTERS)[]).map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={filter === k}
                onClick={() => setFilter(k)}
                className={cx(
                  "min-h-11 cursor-pointer rounded-full border px-5 text-body-sm font-medium transition-colors",
                  filter === k ? "border-ink bg-ink text-paper" : "border-ink/20 bg-paper hover:border-ink",
                )}
              >
                {FILTERS[k].label}
                {k === "action" && kpis?.needsAction ? <span className="ml-2 rounded-full bg-field px-2 text-ink">{kpis.needsAction}</span> : null}
              </button>
            ))}
          </div>
          <label className="relative block w-full lg:w-80">
            <span className="sr-only">Search orders</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search product, mandate, status…"
              className="field-focus min-h-11 w-full rounded-full border border-ink/20 bg-paper pl-11 pr-5 text-body"
            />
          </label>
        </div>

        <div className="mt-6 overflow-hidden rounded-card bg-paper">
          {rows === null ? (
            <p className="flex items-center gap-3 p-10 text-subheading" role="status"><Loader2 className="size-5 animate-spin" aria-hidden /> Loading orders…</p>
          ) : (
            <div style={{ height: Math.min(720, 112 + Math.max(visible.length, 4) * 64) }}>
              <AgGridReact<Row>
                theme={gridTheme}
                rowData={visible}
                columnDefs={columns}
                quickFilterText={query}
                getRowId={(p) => p.data.id}
                rowSelection={{ mode: "singleRow", checkboxes: false, enableClickSelection: true }}
                onRowClicked={(e) => e.data && setSelected(e.data)}
                // Keyboard: arrow keys move between cells, Enter or Space opens the order.
                onCellKeyDown={(e) => {
                  const ev = e.event as KeyboardEvent | null | undefined;
                  if (e.data && ev && (ev.key === "Enter" || ev.key === " ")) {
                    ev.preventDefault();
                    setSelected(e.data);
                  }
                }}
                pagination={visible.length > 50}
                paginationPageSize={50}
                overlayNoRowsTemplate="<span style='padding:24px'>No agent orders here yet.</span>"
              />
            </div>
          )}
        </div>
        <p className="mt-3 text-body-sm text-muted">Click an order, or press Enter on it, to see the evidence and act. Updates every 15 seconds.</p>

        <AgentTrust refreshKey={refreshed} />
      </Container>

      {selected && <OrderDrawer row={selected} onClose={() => setSelected(null)} onChanged={load} />}
    </>
  );
}

function OrderDrawer({ row, onClose, onChanged }: { row: Row; onClose: () => void; onChanged: () => Promise<void> }) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDetail(null);
    fetch(`/api/orders/${row.id}`, { cache: "no-store" }).then(async (r) => r.ok && setDetail(await r.json()));
  }, [row.id, row.status]);

  const drawerRef = useRef<HTMLElement>(null);
  useFocusTrap(drawerRef, true, onClose);

  async function act(path: string, body?: object) {
    setBusy(path);
    setError(null);
    const res = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    if (!res.ok) setError(`That didn't work (${(await res.json().catch(() => ({}))).error ?? res.status}).`);
    await onChanged();
    setBusy(null);
  }

  const res = detail?.order.resolution;
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        onClick={(e) => e.stopPropagation()}
        className="h-full w-full max-w-lg overflow-y-auto bg-paper p-[27px] sm:p-10"
      >
        <div className="flex items-start justify-between gap-4">
          <StatusBadge status={row.status} />
          <button type="button" onClick={onClose} className="grid size-11 cursor-pointer place-items-center rounded-full hover:bg-bone" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <h2 id="drawer-title" className="mt-5 heading-type text-heading-sm">{row.product}</h2>
        <p className="mt-1 text-body-sm text-muted">{[row.brand, row.variant, row.retailer].filter(Boolean).join(" · ")}</p>
        <p className="mt-4 font-mono text-subheading tabular">{money(row.amount, row.currency)}</p>
        {row.request && <p className="mt-6 rounded-[20px] bg-bone p-4 text-body">Mandate: “{row.request}”</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          {row.guardBypassed ? <Badge tone="bad" icon={<AlertTriangle className="size-3.5" aria-hidden />}>Agent skipped checks</Badge> : <Badge tone="ok" icon={<ShieldCheck className="size-3.5" aria-hidden />}>Agent passed checks</Badge>}
          <Badge tone={row.agentVerified ? "neutral" : "warn"}>{row.agentName}{row.agentVia === "mcp" ? " via MCP" : ""}{row.agentVerified ? "" : " · unregistered"}</Badge>
          {row.agentConfidence != null && <Badge tone="neutral">Agent confidence {Math.round(row.agentConfidence * 100)}%</Badge>}
        </div>

        {!detail && (
          <p className="mt-8 flex items-center gap-2 text-body-sm text-muted" role="status">
            <Loader2 className="size-4 animate-spin" aria-hidden /> Loading evidence…
          </p>
        )}
        {res && (
          <section className="on-deep mt-8 rounded-card bg-deep p-6 text-paper" aria-label="Verdict">
            <div className="flex flex-wrap items-center gap-3">
              <VerdictBadge verdict={res.decision.verdict} />
              <span className="font-mono text-body-sm text-paper/70">{res.decision.confidence.toFixed(2)}</span>
            </div>
            <p className="mt-4 heading-type text-heading-sm">{VERDICT[res.decision.verdict]?.who}</p>
            <ul className="mt-4 space-y-2 text-body-sm">
              {res.decision.evidence.map((e, i) => (
                <li key={i}><span className="font-mono text-field">{e.source.replace("_", " ")}</span> <span className="text-paper/85">{e.finding}</span></li>
              ))}
            </ul>
            {res.evidencePack && <p className="mt-4 font-mono text-caption text-paper/60">Evidence pack {shortHash(res.evidencePack.digest, 16)}</p>}
            {res.settlement && (
              <div className="mt-5 rounded-[20px] bg-paper/10 px-4 py-3">
                <p className="text-body-sm">
                  {res.settlement.status === "SUCCESS"
                    ? `${res.settlement.from} paid you ${money(res.settlement.amount, res.settlement.currency)} through PayPal Payouts.`
                    : res.settlement.status === "PENDING"
                      ? `${res.settlement.from} is paying you ${money(res.settlement.amount, res.settlement.currency)}: PayPal is processing the payout.`
                      : `${res.settlement.from} owes you ${money(res.settlement.amount, res.settlement.currency)}; the payout didn't go through.`}
                </p>
                {res.settlement.error && res.settlement.status !== "SUCCESS" && <p className="mt-1 text-caption text-paper/70">{res.settlement.error}</p>}
                {(res.settlement.transactionId ?? res.settlement.payoutBatchId) && (
                  <p className="mt-1 font-mono text-caption text-paper/60">Payout {shortHash(res.settlement.transactionId ?? res.settlement.payoutBatchId!, 16)}</p>
                )}
              </div>
            )}
          </section>
        )}

        {error && <p role="alert" className="mt-6 rounded-[16px] bg-bad-bg p-3 text-body-sm text-bad">{error}</p>}
        <div className="mt-8 flex flex-col gap-3">
          {row.status === "CLAIM_OPEN" && (
            <PillButton tone="solid" onClick={() => act(`/api/orders/${row.id}/resolve`, { action: "accept_claim" })} disabled={!!busy}>
              {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <ShieldCheck className="size-4" aria-hidden />} Accept claim & refund
            </PillButton>
          )}
          {row.status === "RETURN_PENDING" && (
            <PillButton tone="solid" onClick={() => act(`/api/orders/${row.id}/resolve`, { action: "return_received" })} disabled={!!busy}>
              {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <PackageCheck className="size-4" aria-hidden />} Mark return received
            </PillButton>
          )}
          {(res?.settlement?.status === "FAILED" || res?.settlement?.status === "NOT_CONFIGURED") && (
            <PillButton tone="solid" onClick={() => act(`/api/orders/${row.id}/resolve`, { action: "retry_settlement" })} disabled={!!busy}>
              {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <RefreshCw className="size-4" aria-hidden />} Collect from {res.settlement.from} again
            </PillButton>
          )}
          {row.status === "AUTHORIZED" && (
            <PillButton tone="ink" onClick={() => act(`/api/orders/${row.id}/expire-window`)} disabled={!!busy}>
              {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <FastForward className="size-4" aria-hidden />} Demo: close the undo window
            </PillButton>
          )}
          <Link href={`/orders/${row.id}`} className="inline-flex min-h-11 items-center gap-2 self-start text-body underline underline-offset-4">
            Open the shopper&apos;s view <ExternalLink className="size-4" aria-hidden />
          </Link>
        </div>

        {detail && (
          <section className="mt-10" aria-labelledby="drawer-chain">
            <div className="flex items-center justify-between">
              <h3 id="drawer-chain" className="heading-type text-subheading">Event chain</h3>
              <Badge tone={detail.chain.intact ? "ok" : "bad"}>{detail.chain.intact ? "Intact" : "Tampered"}</Badge>
            </div>
            <ol className="mt-4 space-y-2 font-mono text-caption">
              {detail.chain.events.map((e) => (
                <li key={e.seq} className="flex justify-between gap-3 border-b border-ink/10 pb-2">
                  <span className="font-sans text-body-sm">{e.seq}. {EVENT_LABEL[e.type] ?? e.type}</span>
                  <span className="text-muted">{shortHash(e.hash, 10)}</span>
                </li>
              ))}
            </ol>
          </section>
        )}
        {row.paypalRef && <p className="mt-8 font-mono text-caption text-muted">PayPal ref {row.paypalRef}</p>}
      </aside>
    </div>
  );
}
