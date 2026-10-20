import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { activityEventSchema, type ActivityEvent } from "./activity-event.js";

/** The store's latest activity. */
export type ActivityFeed = {
  /** Events, newest first. */
  events: ActivityEvent[];
};

export const activityFeedSchema: Schema<ActivityFeed> = s.object<ActivityFeed>({
  events: s.array(s.lazy(() => activityEventSchema)),
});
