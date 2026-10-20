"use client";

import "./undo-timeline.css";

import type { EventModel, GridColumnConfig, Scheduler } from "@bryntum/scheduler";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ORDER_STATUS, money } from "./ui";

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
};

/**
 * Bryntum ships as one prebuilt 4.6 MB file, too big to run through the production bundler, so
 * scripts/copy-bryntum.mjs copies it into public/bryntum and the browser loads it directly, once.
 */
const BASE = "/bryntum";
const STYLES = ["fontawesome/css/fontawesome.css", "fontawesome/css/solid.css", "scheduler.css", "svalbard-light.css"];
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

/** Bar colours follow the status badges, so a bar and its row in the grid read the same. */
const TONE_COLOR: Record<string, string> = {
  held: "#2e47d9",
  ok: "#157f3d",
  warn: "#9a5b00",
  bad: "#b42318",
  neutral: "#4a4f5c",
};

const HOUR = 3_600_000;

const COLUMNS: GridColumnConfig[] = [
  { type: "resourceInfo", text: "Agent", field: "name", width: 210, showEventCount: false, showImage: false },
  { text: "Orders", field: "orders", width: 80, align: "right" },
];
/** On a phone the agent name alone, so the schedule keeps most of the width. */
const COLUMNS_NARROW: GridColumnConfig[] = [{ type: "resourceInfo", text: "Agent", field: "name", width: 120, showEventCount: false, showImage: false }];

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
type Bar = EventModel & { amountLabel: string; statusLabel: string; variant: string };

function tooltip({ eventRecord }: { eventRecord: EventModel }) {
  const e = eventRecord as Bar;
  const fmt = (d: Date) => d.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  return `<div class="undo-tip">
    <strong>${escape(e.name)}</strong>
    <span>${escape([e.variant, e.amountLabel].filter(Boolean).join(" · "))}</span>
    <span>${escape(e.statusLabel)}</span>
    <span>Bought ${fmt(e.startDate as Date)} · window closes ${fmt(e.endDate as Date)}</span>
    <em>Click to open the order</em>
  </div>`;
}

/**
 * Every agent order's undo window on one timeline: a row per agent, a bar from purchase to the moment the
 * window closes, and a line for now. Bars still crossing the line are the purchases a shopper can still undo.
 */
export function UndoTimeline({ orders, onOpen }: { orders: TimelineOrder[]; onOpen: (id: string) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const scheduler = useRef<Scheduler | null>(null);
  const openRef = useRef(onOpen);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  // The console refetches every 15 seconds; only rebuild the bars when something on them actually changed.
  const key = orders.map((o) => `${o.id}:${o.status}:${o.windowEndsAt}`).join("|");
  const [now] = useState(() => Date.now());

  useEffect(() => {
    openRef.current = onOpen;
  }, [onOpen]);

  const data = useMemo(() => {
    const placed = orders.filter((o) => o.windowEndsAt && new Date(o.windowEndsAt).getTime() > now - 14 * 24 * HOUR);
    const agents = [...new Set(placed.map((o) => o.agentName))].sort();
    const events = placed.map((o) => {
      const s = ORDER_STATUS[o.status];
      return {
        id: o.id,
        resourceId: o.agentName,
        name: o.product,
        startDate: new Date(o.createdAt),
        endDate: new Date(o.windowEndsAt!),
        eventColor: TONE_COLOR[s?.tone ?? "neutral"],
        // Extra fields read back by the bar renderer and the tooltip.
        statusLabel: s?.label ?? o.status,
        amountLabel: money(o.amount, o.currency),
        variant: o.variant,
      };
    });
    const starts = events.map((e) => e.startDate.getTime());
    const ends = events.map((e) => e.endDate.getTime());
    return {
      events,
      resources: agents.map((name) => ({ id: name, name, orders: placed.filter((o) => o.agentName === name).length })),
      // Always show a few hours either side of now, even when nothing is open.
      startDate: new Date(Math.min(now - 6 * HOUR, ...starts) - HOUR),
      endDate: new Date(Math.max(now + 6 * HOUR, ...ends) + HOUR),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `key` captures every field the bars use.
  }, [key]);
  const dataRef = useRef(data);
  const hasBars = data.events.length > 0;

  // Create the scheduler once; it lives as long as the section is on screen.
  useEffect(() => {
    let cancelled = false;
    loadBryntum().then(
      ({ Scheduler }) => {
        if (cancelled || !box.current) return;
        const d = dataRef.current;
        scheduler.current = new Scheduler({
          appendTo: box.current,
          readOnly: true,
          rowHeight: 56,
          barMargin: 10,
          eventStyle: "tonal",
          viewPreset: "hourAndDay",
          startDate: d.startDate,
          endDate: d.endDate,
          columns: window.innerWidth < 640 ? COLUMNS_NARROW : COLUMNS,
          resources: d.resources,
          events: d.events,
          eventRenderer: ({ eventRecord }: { eventRecord: EventModel }) => `${escape(eventRecord.name)} · ${escape((eventRecord as Bar).amountLabel)}`,
          features: {
            timeRanges: { showCurrentTimeLine: { name: "Now" } },
            eventTooltip: { template: tooltip },
            // A read-only view: no dragging, resizing, creating, editing or context menus.
            eventDrag: false,
            eventResize: false,
            eventDragCreate: false,
            eventEdit: false,
            eventMenu: false,
            scheduleMenu: false,
            cellMenu: false,
          },
          listeners: { eventClick: ({ eventRecord }: { eventRecord: EventModel }) => openRef.current(String(eventRecord.id)) },
        });
        // Centre on now once it has been laid out, and leave the merchant's scrolling alone after that.
        setTimeout(() => void scheduler.current?.scrollToDate(new Date(now), { block: "center", animate: false }));
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
    s.setTimeSpan(data.startDate, data.endDate);
  }, [data]);

  if (!hasBars) {
    return <p className="p-10 text-body text-muted">No undo windows in the last two weeks yet.</p>;
  }

  return (
    <div className="undo-timeline relative h-[440px]">
      <div ref={box} className="h-full" />
      {state !== "ready" && (
        <p className="absolute inset-0 flex items-center gap-3 p-10 text-subheading" role="status">
          {state === "loading" ? (
            <>
              <Loader2 className="size-5 animate-spin" aria-hidden /> Loading timeline…
            </>
          ) : (
            "The timeline didn't load. Refresh the page to try again; the orders grid above has the same data."
          )}
        </p>
      )}
    </div>
  );
}
