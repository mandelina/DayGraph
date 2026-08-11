import { describe, expect, it } from "vitest";
import {
  buildTimelineSlices,
  bucketizeTimeline,
} from "./useActivityData";
import type { Activity } from "../../entities/activity/model";

describe("timeline data builders", () => {
  it("연속된 같은 앱 로그를 하나의 slice로 병합한다", () => {
    const rows = [
      createActivity({
        timestamp: "2026-08-11T00:00:00.000Z",
        app_name: "VSCode",
        clicks: 1,
        keypress: 2,
      }),
      createActivity({
        timestamp: "2026-08-11T00:00:01.000Z",
        app_name: "VSCode",
        clicks: 2,
        keypress: 3,
      }),
      createActivity({
        timestamp: "2026-08-11T00:00:03.000Z",
        app_name: "Chrome",
        clicks: 1,
        keypress: 1,
      }),
    ];

    const slices = buildTimelineSlices(rows);

    expect(slices).toHaveLength(2);
    expect(slices[0]).toMatchObject({
      start: "2026-08-11T00:00:00.000Z",
      end: "2026-08-11T00:00:02.000Z",
      appName: "VSCode",
      clicks: 3,
      keypress: 5,
    });
  });

  it("slice를 5분 bucket으로 합산한다", () => {
    const slices = buildTimelineSlices([
      createActivity({
        timestamp: "2026-08-11T00:00:00.000Z",
        app_name: "VSCode",
      }),
      createActivity({
        timestamp: "2026-08-11T00:00:01.000Z",
        app_name: "VSCode",
      }),
      createActivity({
        timestamp: "2026-08-11T00:00:03.000Z",
        app_name: "Chrome",
      }),
    ]);

    const buckets = bucketizeTimeline(slices);

    expect(buckets).toHaveLength(1);
    expect(buckets[0].totalDuration).toBe(3);
    expect(buckets[0].representative?.appName).toBe("VSCode");
    expect(buckets[0].representative?.duration).toBe(2);
  });
});

function createActivity(overrides: Partial<Activity>): Activity {
  return {
    timestamp: "2026-08-11T00:00:00.000Z",
    app_name: "VSCode",
    app_path: null,
    bundle_id: null,
    window_title: "DayGraph",
    display_id: 0,
    is_active: true,
    clicks: 0,
    keypress: 0,
    ...overrides,
  };
}
