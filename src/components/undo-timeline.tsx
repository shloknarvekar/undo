"use client";

import "./undo-timeline.css";

import type { EventModel, GridColumnConfig, Model, ResourceModel, Scheduler } from "@bryntum/scheduler";
import { Crosshair } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ORDER_STATUS, cx, money } from "./ui";

export type TimelineOrder = {
  id: string;
  createdAt: string;
  windowEndsAt: string | null;
  status: string;
  amount: number;
  currency: string;
  product: string;
  variant: string;
  agentName: string;
  agentVerified: boolean;
};

/**
 * Bryntum ships as one prebuilt 4.6 MB file, too big to run through the production bundler, so
 * scripts/copy-bryntum.mjs copies it into public/bryntum and the browser loads it directly, once.
 */
const BASE = "/bryntum";
const STYLES = ["fontawesome/css/fontawesome.css", "fontawesome/css/solid.css", "scheduler.css", "svalbard-dark.css"];
type BryntumModule = typeof import("@bryntum/scheduler");
let bryntum: Promise<BryntumModule> | null = null;

function loadBryntum() {
  bryntum ??= (async () => {
    // Bryntum's styles go first in <head>, so Undo's overrides in undo-timeline.css still win.
    const first = document.head.firstChild;
    await Promise.all(
      STYLES.map(
        (file) =>
          new Promise<void>((resolve, reject) => {
            const link = Object.assign(document.createElement("link"), { rel: "stylesheet", href: `${BASE}/${file}` });
            link.onload = () => resolve();
            link.onerror = () => reject(new Error(`Could not load ${file}`));
            document.head.insertBefore(link, first);
          }),
      ),
    );
    const src = `${BASE}/scheduler.module.js`;
    return (await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ src)) as BryntumModule;
  })().catch((e) => {
    bryntum = null; // let the next visit try again
    throw e;
  });
  return bryntum;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

/** Every bar falls in one of four groups; the chips above the timeline are both its legend and its filter. */
type Group = "open" | "action" | "undone" | "kept";
const GROUPS: { id: Group; label: string }[] = [
  { id: "open", label: "Open now" },
  { id: "action", label: "Needs you" },
  { id: "undone", label: "Undone" },
  { id: "kept", label: "Kept" },
];

function groupOf(status: string, endsAt: number, now: number): Group {
  if (status === "AUTHORIZED") return endsAt > now ? "open" : "kept";
  if (["VOIDED", "REFUNDED", "PARTIALLY_REFUNDED"].includes(status)) return "undone";
  if (["CLAIM_OPEN", "RETURN_PENDING", "REVIEW", "DISPUTED"].includes(status)) return "action";
  return "kept";
}

function left(ms: number) {
  const m = Math.max(0, Math.round(ms / MINUTE));
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;
}

const ZOOMS = [
  { id: "12h", label: "12 hours", before: 4 * HOUR, after: 8 * HOUR },
  { id: "2d", label: "2 days", before: 24 * HOUR, after: 24 * HOUR },
  { id: "week", label: "Week", before: 5 * 24 * HOUR, after: 2 * 24 * HOUR },
] as const;
type Zoom = (typeof ZOOMS)[number]["id"];

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
type Bar = EventModel & { group: Group; statusLabel: string; amountLabel: string; variant: string };
type Agent = ResourceModel & { verified: boolean; orders: number };

function agentCell({ record }: { record: Model }) {
  const a = record as Agent;
  const initials = a.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return `<div class="ut-agent">
    <span class="ut-avatar${a.verified ? " is-verified" : ""}" aria-hidden="true">${escape(initials)}</span>
    <span class="ut-agent-text"><b>${escape(a.name)}</b><small>${a.verified ? "Registered" : "Unregistered"} · ${a.orders} order${a.orders === 1 ? "" : "s"}</small></span>
  </div>`;
}

const COLUMNS: GridColumnConfig[] = [{ text: "Agent", field: "name", width: 230, htmlEncode: false, renderer: agentCell }];
/** On a phone a narrower agent column, so the schedule keeps most of the width. */
const COLUMNS_NARROW: GridColumnConfig[] = [{ text: "Agent", field: "name", width: 150, htmlEncode: false, renderer: agentCell }];

/** The bar itself says what happened, so colour is never the only signal. */
function barHtml({ eventRecord }: { eventRecord: EventModel }) {
  const e = eventRecord as Bar;
  const meta =
    e.group === "open"
      ? `${escape(e.amountLabel)} · ${left((e.endDate as Date).getTime() - Date.now())} left`
      : `${escape(e.statusLabel)} · ${escape(e.amountLabel)}`;
  return `<span class="ut-bar"><i class="ut-dot" aria-hidden="true"></i><span class="ut-text"><b>${escape(e.name)}</b><small>${meta}</small></span></span>`;
}

function tooltip({ eventRecord }: { eventRecord: EventModel }) {
  const e = eventRecord as Bar;
  const fmt = (d: Date) => d.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  const end = (e.endDate as Date).getTime();
  return `<div class="undo-tip">
    <strong>${escape(e.name)}</strong>
    <span>${escape([e.variant, e.amountLabel].filter(Boolean).join(" · "))}</span>
    <span class="undo-tip-status">${escape(e.statusLabel)}${e.group === "open" ? ` · ${left(end - Date.now())} left to undo` : ""}</span>
    <span>Bought ${fmt(e.startDate as Date)}</span>
    <span>Window ${end > Date.now() ? "closes" : "closed"} ${fmt(e.endDate as Date)}</span>
    <em>Click to open the order</em>
  </div>`;
}

/**
 * Every agent order's undo window on one timeline: a row per agent, a bar from purchase to the moment the window
 * closes, and a line for now. Lime bars crossing the line are the purchases a shopper can still undo.
 */
export function UndoTimeline({ orders, onOpen }: { orders: TimelineOrder[]; onOpen: (id: string) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const scheduler = useRef<Scheduler | null>(null);
  const openRef = useRef(onOpen);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  const [zoom, setZoom] = useState<Zoom | null>(null);
  const [hidden, setHidden] = useState<Group[]>([]);
  // `now` anchors the time axis; `tick` moves every 30 seconds so countdowns stay true.
  const [now] = useState(() => Date.now());
  const [tick, setTick] = useState(now);
  // The console refetches every 15 seconds; only rebuild the bars when something on them actually changed.
  const key = orders.map((o) => `${o.id}:${o.status}:${o.windowEndsAt}`).join("|");

  useEffect(() => {
    openRef.current = onOpen;
  }, [onOpen]);

  useEffect(() => {
    const t = setInterval(() => {
      setTick(Date.now());
      scheduler.current?.refreshRows();
    }, 30_000);
    return () => clearInterval(t);
  }, []);

  const data = useMemo(() => {
    const placed = orders.filter((o) => o.windowEndsAt && new Date(o.windowEndsAt).getTime() > now - 14 * 24 * HOUR);
    const agents = [...new Map(placed.map((o) => [o.agentName, o.agentVerified])).entries()].sort(([a], [b]) => a.localeCompare(b));
    const events = placed.map((o) => {
      const end = new Date(o.windowEndsAt!).getTime();
      const group = groupOf(o.status, end, now);
      return {
        id: o.id,
        resourceId: o.agentName,
        name: o.product,
        startDate: new Date(o.createdAt),
        endDate: new Date(end),
        cls: `ut-${group}`,
        group,
        status: o.status,
        statusLabel: group === "kept" && o.status === "AUTHORIZED" ? "Window closed" : ORDER_STATUS[o.status]?.label ?? o.status,
        amountLabel: money(o.amount, o.currency),
        variant: o.variant,
      };
    });
    const starts = events.map((e) => e.startDate.getTime());
    const ends = events.map((e) => e.endDate.getTime());
    return {
      events,
      resources: agents.map(([name, verified]) => ({ id: name, name, verified, orders: placed.filter((o) => o.agentName === name).length })),
      startDate: new Date(Math.min(now - 7 * 24 * HOUR, ...starts) - HOUR),
      endDate: new Date(Math.max(now + 2 * 24 * HOUR, ...ends) + HOUR),
      // First view: the day either side of now if anything happened then, otherwise the latest activity.
      focus: ends.some((t) => t > now - 24 * HOUR)
        ? { zoom: "2d" as const, startDate: new Date(now - 24 * HOUR), endDate: new Date(now + 24 * HOUR) }
        : { zoom: null, startDate: new Date(Math.max(...ends, 0) - 36 * HOUR), endDate: new Date(Math.max(...ends, 0) + 6 * HOUR) },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `key` captures every field the bars use.
  }, [key]);
  const dataRef = useRef(data);
  const hasBars = data.events.length > 0;

  // The header, the chips and the "closing next" list read the same orders against the ticking clock.
  const open = useMemo(
    () =>
      orders
        .filter((o) => o.status === "AUTHORIZED" && o.windowEndsAt && new Date(o.windowEndsAt).getTime() > tick)
        .map((o) => ({ ...o, end: new Date(o.windowEndsAt!).getTime(), start: new Date(o.createdAt).getTime() }))
        .sort((a, b) => a.end - b.end),
    [orders, tick],
  );
  const heldOpen = open.reduce((s, o) => s + o.amount, 0);
  const counts = useMemo(() => {
    const c: Record<Group, number> = { open: 0, action: 0, undone: 0, kept: 0 };
    for (const e of data.events) c[groupOf(e.status, e.endDate.getTime(), tick)]++;
    return c;
  }, [data, tick]);

  function zoomTo(id: Zoom) {
    setZoom(id);
    const z = ZOOMS.find((x) => x.id === id)!;
    const t = tick;
    scheduler.current?.zoomToSpan({ startDate: new Date(t - z.before), endDate: new Date(t + z.after) });
  }

  // Create the scheduler once; it lives as long as the section is on screen.
  useEffect(() => {
    if (!hasBars) return;
    let cancelled = false;
    loadBryntum().then(
      ({ Scheduler }) => {
        if (cancelled || !box.current) return;
        const d = dataRef.current;
        scheduler.current = new Scheduler({
          appendTo: box.current,
          readOnly: true,
          rowHeight: 68,
          barMargin: 12,
          eventStyle: "filled",
          viewPreset: "hourAndDay",
          startDate: d.startDate,
          endDate: d.endDate,
          columns: window.innerWidth < 640 ? COLUMNS_NARROW : COLUMNS,
          resources: d.resources,
          events: d.events,
          eventRenderer: barHtml,
          features: {
            timeRanges: { showCurrentTimeLine: { name: "Now" } },
            eventTooltip: { template: tooltip, cls: "undo-tooltip" },
            // A read-only view: no dragging, resizing, creating, editing or context menus.
            eventDrag: false,
            eventResize: false,
            eventDragCreate: false,
            eventEdit: false,
            eventMenu: false,
            scheduleMenu: false,
            cellMenu: false,
            headerMenu: false,
            timeAxisHeaderMenu: false,
            sort: false,
          },
          listeners: { eventClick: ({ eventRecord }: { eventRecord: EventModel }) => openRef.current(String(eventRecord.id)) },
        });
        // Frame the first view once laid out; the merchant's scrolling is theirs after that.
        setTimeout(() => {
          scheduler.current?.zoomToSpan({ startDate: d.focus.startDate, endDate: d.focus.endDate });
          setZoom(d.focus.zoom);
        });
        setState("ready");
      },
      () => !cancelled && setState("failed"),
    );
    return () => {
      cancelled = true;
      scheduler.current?.destroy();
      scheduler.current = null;
    };
  }, [now, hasBars]);

  // Later refreshes swap the data in place instead of rebuilding the timeline.
  useEffect(() => {
    dataRef.current = data;
    const s = scheduler.current;
    if (!s) return;
    s.resources = data.resources;
    s.events = data.events;
  }, [data]);

  // The chips hide whole groups of bars.
  useEffect(() => {
    const store = scheduler.current?.eventStore;
    if (!store) return;
    if (hidden.length) store.filter({ id: "groups", filterBy: (e: Bar) => !hidden.includes(e.group) });
    else store.removeFilter("groups");
  }, [hidden, state, data]);

  const next = open[0];

  return (
    <section aria-labelledby="timeline-title" className="on-deep mt-16 overflow-hidden rounded-card bg-deep text-paper">
      <div className="grid gap-8 px-6 pt-8 sm:px-8 sm:pt-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <h2 id="timeline-title" className="font-mono text-body-sm text-paper/70">Undo windows</h2>
          <p className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1" role="status" aria-atomic="true">
            <span className="display-type text-[56px] leading-none text-field tabular sm:text-[72px]">{open.length}</span>
            <span className="heading-type text-heading-sm">
              {open.length === 1 ? "window open" : "windows open"}
              <span className="block text-body font-normal text-paper/70 sm:inline sm:pl-3">
                {open.length ? `${money(heldOpen)} that shoppers can still undo` : "Every purchase is past its undo window"}
              </span>
            </span>
          </p>
          <p className="mt-3 text-body text-paper/70">
            {next ? (
              <>
                Next to close: <span className="text-paper">{next.product}</span> in{" "}
                <span className="font-mono text-field tabular">{left(next.end - tick)}</span>
              </>
            ) : (
              "New agent purchases appear here the moment PayPal holds the money."
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Zoom" className="flex rounded-full border border-paper/25 p-1">
            {ZOOMS.map((z) => (
              <button
                key={z.id}
                type="button"
                aria-pressed={zoom === z.id}
                disabled={state !== "ready"}
                onClick={() => zoomTo(z.id)}
                className={cx(
                  "min-h-11 cursor-pointer rounded-full px-4 text-body-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50",
                  zoom === z.id ? "bg-paper text-deep" : "text-paper/80 hover:text-paper",
                )}
              >
                {z.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={state !== "ready"}
            onClick={() => scheduler.current?.scrollToNow({ block: "center" })}
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-paper/25 px-4 text-body-sm font-medium transition-colors duration-200 hover:border-field hover:text-field disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Crosshair className="size-4" aria-hidden /> Jump to now
          </button>
        </div>
      </div>

      <div role="group" aria-label="Show bars" className="mt-8 flex flex-wrap gap-2 px-6 sm:px-8">
        {GROUPS.map((g) => {
          const on = !hidden.includes(g.id);
          return (
            <button
              key={g.id}
              type="button"
              aria-pressed={on}
              onClick={() => setHidden((h) => (on ? [...h, g.id] : h.filter((x) => x !== g.id)))}
              className={cx(
                "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-body-sm font-medium transition-[background-color,border-color,color] duration-200",
                on ? "border-paper/25 bg-deep-2 text-paper hover:border-paper/50" : "border-paper/10 text-paper/45 line-through decoration-paper/40 hover:text-paper/70",
              )}
            >
              <span className={cx("ut-swatch", `ut-swatch-${g.id}`)} aria-hidden />
              {g.label}
              <span className="font-mono text-paper/60 tabular">{counts[g.id]}</span>
            </button>
          );
        })}
      </div>

      <div className="undo-timeline relative mt-6 h-[460px] border-y border-paper/10">
        <div ref={box} className="h-full" />
        {hasBars && state !== "ready" && (
          <div className="absolute inset-0 grid content-start bg-deep" role="status" aria-label={state === "loading" ? "Loading timeline" : undefined}>
            {state === "loading" ? (
              Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex h-[68px] items-center gap-4 border-b border-paper/10 px-6">
                  <span className="size-9 shrink-0 rounded-full bg-paper/10" />
                  <span className="h-3 w-32 rounded-full bg-paper/10" />
                  <span className="ml-auto h-10 rounded-[10px] bg-paper/[0.06] motion-safe:animate-pulse" style={{ width: `${30 + ((i * 17) % 40)}%` }} />
                </div>
              ))
            ) : (
              <p className="p-10 text-subheading">The timeline didn&apos;t load. Refresh to try again; the orders grid above has the same data.</p>
            )}
          </div>
        )}
        {!hasBars && <p className="grid h-full place-items-center p-10 text-center text-subheading text-paper/70">No undo windows in the last two weeks yet.</p>}
      </div>

      <div className="px-6 py-8 sm:px-8">
        <h3 className="text-body-sm font-medium text-paper/70">Closing next</h3>
        {open.length ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {open.slice(0, 4).map((o) => {
              const remaining = Math.max(0, Math.min(1, (o.end - tick) / (o.end - o.start)));
              return (
                <li key={o.id}>
                  <button
                    type="button"
                    onClick={() => onOpen(o.id)}
                    className="flex h-full w-full cursor-pointer flex-col rounded-[20px] border border-paper/15 bg-deep-2 p-5 text-left transition-colors duration-200 hover:border-field"
                  >
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="font-mono text-heading-sm text-field tabular">{left(o.end - tick)}</span>
                      <span className="font-mono text-body-sm text-paper/70 tabular">{money(o.amount, o.currency)}</span>
                    </span>
                    <span className="mt-3 line-clamp-2 font-medium">{o.product}</span>
                    <span className="mt-1 text-body-sm text-paper/60">{o.agentName}</span>
                    <span className="mt-auto block pt-4" aria-hidden>
                      <span className="block h-1 overflow-hidden rounded-full bg-paper/10">
                        <span
                          className="block h-full origin-left rounded-full bg-field transition-transform duration-500 motion-reduce:transition-none"
                          style={{ transform: `scaleX(${remaining})` }}
                        />
                      </span>
                    </span>
                    <span className="sr-only">{Math.round(remaining * 100)}% of the undo window left. Open the order.</span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-3 text-body text-paper/70">Nothing can be undone right now. Every window has closed.</p>
        )}
      </div>
    </section>
  );
}
