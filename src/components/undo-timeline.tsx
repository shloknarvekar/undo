"use client";

import "@bryntum/scheduler/fontawesome/css/fontawesome.css";
import "@bryntum/scheduler/fontawesome/css/solid.css";
import "@bryntum/scheduler/scheduler.css";
import "@bryntum/scheduler/svalbard-light.css";
import "./undo-timeline.css";

import { StringHelper, type EventModel, type GridColumnConfig } from "@bryntum/scheduler";
import { BryntumScheduler } from "@bryntum/scheduler-react";
import { useMemo, useState } from "react";
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

/** Bar colours follow the status badges, so a bar and its row in the grid read the same. */
const TONE_COLOR: Record<string, string> = {
  held: "#2e47d9",
  ok: "#157f3d",
  warn: "#9a5b00",
  bad: "#b42318",
  neutral: "#4a4f5c",
};

const HOUR = 3_600_000;

// Stable config objects, so a re-render never makes the wrapper re-apply them.
const COLUMNS: GridColumnConfig[] = [
  { type: "resourceInfo", text: "Agent", field: "name", width: 210, showEventCount: false, showImage: false },
  { text: "Orders", field: "orders", width: 80, align: "right" },
];
/** On a phone the agent name alone, so the schedule keeps most of the width. */
const COLUMNS_NARROW: GridColumnConfig[] = [{ type: "resourceInfo", text: "Agent", field: "name", width: 120, showEventCount: false, showImage: false }];
const TIME_RANGES = { showCurrentTimeLine: { name: "Now" } };
const TOOLTIP = {
  template: ({ eventRecord }: { eventRecord: EventModel }) => {
    const e = eventRecord as EventModel & { amountLabel: string; statusLabel: string; variant: string };
    const fmt = (d: Date) => d.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    return `<div class="undo-tip">
      <strong>${StringHelper.encodeHtml(e.name)}</strong>
      <span>${StringHelper.encodeHtml([e.variant, e.amountLabel].filter(Boolean).join(" · "))}</span>
      <span>${StringHelper.encodeHtml(e.statusLabel)}</span>
      <span>Bought ${fmt(e.startDate as Date)} · window closes ${fmt(e.endDate as Date)}</span>
      <em>Click to open the order</em>
    </div>`;
  },
};

/**
 * Every agent order's undo window on one timeline: a row per agent, a bar from purchase to the moment the
 * window closes, and a line for now. Bars still crossing the line are the purchases a shopper can still undo.
 */
export function UndoTimeline({ orders, onOpen }: { orders: TimelineOrder[]; onOpen: (id: string) => void }) {
  // The console refetches every 15 seconds; only rebuild the bars when something on them actually changed.
  const key = orders.map((o) => `${o.id}:${o.status}:${o.windowEndsAt}`).join("|");
  // Centre on now once, when the timeline first appears, and leave the merchant's scrolling alone after that.
  const [now] = useState(() => Date.now());
  const [narrow] = useState(() => window.innerWidth < 640);
  const [visibleDate] = useState(() => ({ date: new Date(now), block: "center" as const }));
  const { events, resources, startDate, endDate } = useMemo(() => {
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
        status: o.status,
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

  if (!events.length) {
    return <p className="p-10 text-body text-muted">No undo windows in the last two weeks yet.</p>;
  }

  return (
    <div className="undo-timeline h-[440px]">
      <BryntumScheduler
        readOnly
        rowHeight={56}
        barMargin={10}
        eventStyle="tonal"
        viewPreset="hourAndDay"
        startDate={startDate}
        endDate={endDate}
        visibleDate={visibleDate}
        resources={resources}
        events={events}
        columns={narrow ? COLUMNS_NARROW : COLUMNS}
        eventRenderer={({ eventRecord }: { eventRecord: EventModel }) => {
          const e = eventRecord as EventModel & { amountLabel: string };
          return `${StringHelper.encodeHtml(e.name)} · ${StringHelper.encodeHtml(e.amountLabel)}`;
        }}
        timeRangesFeature={TIME_RANGES}
        eventTooltipFeature={TOOLTIP}
        onEventClick={({ eventRecord }: { eventRecord: EventModel }) => onOpen(String(eventRecord.id))}
        // A read-only view: no dragging, resizing, creating or editing.
        eventDragFeature={false}
        eventResizeFeature={false}
        eventDragCreateFeature={false}
        eventEditFeature={false}
        eventMenuFeature={false}
        scheduleMenuFeature={false}
        cellMenuFeature={false}
      />
    </div>
  );
}
