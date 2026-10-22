"use client";

import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { Pause, Play } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gridTheme } from "./grid-theme";
import { EVENT_LABEL } from "./order-app";
import { cx, money, shortHash } from "./ui";

type Ev = { id: number; at: string; type: string; kind: string; how: string; orderId: string | null; amount: number | null; agent: string | null; ref: string | null };

const POLL_MS = 4000;
const KIND: Record<string, string> = { signature: "Signature", rule: "Rule", ai: "AI", paypal: "PayPal API", person: "Person", record: "Record" };

const ago = (iso: string) => {
  const s = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86_400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" });
};

function EventCell({ data }: ICellRendererParams<Ev>) {
  if (!data) return null;
  return (
    <span className="flex h-full flex-col justify-center leading-tight" title={data.how}>
      <span className="truncate font-medium">{EVENT_LABEL[data.type] ?? data.type}</span>
      <span className="text-caption text-muted">{KIND[data.kind] ?? data.kind}</span>
    </span>
  );
}

/**
 * Live activity: every step Undo records across the store, streamed into AG Grid. New events arrive as row
 * transactions (no reload of the grid) and flash once; moving content can be paused (WCAG 2.2.2).
 */
export function ActivityFeed() {
  const gridRef = useRef<AgGridReact<Ev>>(null);
  const [rows, setRows] = useState<Ev[] | null>(null);
  const [live, setLive] = useState(true);
  const [announce, setAnnounce] = useState("");
  const maxId = useRef(0);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    fetch("/api/merchant/activity", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { events: [] }))
      .then((b: { events: Ev[] }) => {
        setRows(b.events);
        maxId.current = b.events[0]?.id ?? 0;
      })
      .catch(() => setRows([]));
  }, []);

  const pull = useCallback(async () => {
    const res = await fetch(`/api/merchant/activity?after=${maxId.current}`, { cache: "no-store" }).catch(() => null);
    if (!res?.ok) return;
    const { events } = (await res.json()) as { events: Ev[] };
    if (!events.length || !gridRef.current) return;
    maxId.current = Math.max(maxId.current, ...events.map((e) => e.id));
    gridRef.current.api.applyTransactionAsync({ add: events, addIndex: 0 }, (t) => {
      if (!reduced.current) gridRef.current?.api.flashCells({ rowNodes: t.add });
    });
    setAnnounce(`${events.length} new event${events.length === 1 ? "" : "s"}: ${EVENT_LABEL[events[0].type] ?? events[0].type}`);
  }, []);

  useEffect(() => {
    if (!live || rows === null) return;
    const t = setInterval(() => document.visibilityState === "visible" && pull(), POLL_MS);
    return () => clearInterval(t);
  }, [live, rows, pull]);

  // Keep the "2m ago" column honest without re-fetching.
  useEffect(() => {
    const t = setInterval(() => gridRef.current?.api.refreshCells({ columns: ["at"] }), 30_000);
    return () => clearInterval(t);
  }, []);

  const columns = useMemo<ColDef<Ev>[]>(
    () => [
      { field: "at", headerName: "When", width: 110, valueFormatter: (p) => (p.value ? ago(p.value) : ""), tooltipValueGetter: (p) => p.value && new Date(p.value).toLocaleString(), cellClass: "tabular text-muted" },
      { field: "type", headerName: "What happened", flex: 2, minWidth: 220, cellRenderer: EventCell, filter: true },
      {
        field: "orderId",
        headerName: "Order",
        width: 130,
        cellRenderer: (p: ICellRendererParams<Ev>) =>
          p.value ? (
            <Link href={`/orders/${p.value}`} className="font-mono text-body-sm underline-offset-4 hover:underline">
              {shortHash(p.value, 8)}
            </Link>
          ) : (
            <span className="text-muted">—</span>
          ),
      },
      { field: "amount", headerName: "Amount", width: 110, type: "rightAligned", valueFormatter: (p) => (p.value == null ? "—" : money(p.value)), cellClass: "font-mono tabular" },
      { field: "agent", headerName: "Agent", flex: 1, minWidth: 150, valueFormatter: (p) => p.value ?? "—", filter: true },
      { field: "ref", headerName: "PayPal / proof ref", flex: 1, minWidth: 170, valueFormatter: (p) => (p.value ? shortHash(p.value, 18) : "—"), tooltipField: "ref", cellClass: "font-mono text-caption text-muted" },
    ],
    [],
  );

  return (
    <section className="mt-12" aria-labelledby="activity-title">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 id="activity-title" className="display-type text-[36px] leading-none sm:text-[45px]">Live activity</h2>
          <p className="mt-2 max-w-xl text-body-sm text-muted">Every step Undo records at this store, from the hash-chained log. New events stream in as they happen.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 text-body-sm">
            <span aria-hidden className={cx("size-2.5 rounded-full", live ? "bg-ok motion-safe:animate-pulse" : "bg-ash")} />
            {live ? "Live" : "Paused"}
          </span>
          <button
            type="button"
            onClick={() => setLive((l) => !l)}
            aria-pressed={!live}
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-ink/20 bg-paper px-5 text-body-sm font-medium transition-colors hover:border-ink"
          >
            {live ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
            {live ? "Pause" : "Resume"}
          </button>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">{announce}</p>
      <div className="mt-6 overflow-hidden rounded-card bg-paper" style={{ height: 460 }}>
        <AgGridReact<Ev>
          ref={gridRef}
          theme={gridTheme}
          rowData={rows ?? undefined}
          loading={rows === null}
          columnDefs={columns}
          defaultColDef={{ sortable: false, resizable: true }}
          getRowId={(p) => String(p.data.id)}
          rowHeight={56}
          animateRows
          overlayNoRowsTemplate="<span style='padding:24px'>Nothing has happened at this store yet.</span>"
        />
      </div>
    </section>
  );
}
