import { describe, expect, it } from "vitest";
import {
  filterTimelineSlices,
  getTimelineFilterCounts,
} from "./filterTimeline";
import type { TimelineSlice } from "../model";

describe("timeline filters", () => {
  it("집중 구간은 입력/클릭 합산이 5 이상인 slice만 남긴다", () => {
    const slices = [
      createSlice({ appName: "VSCode", clicks: 1, keypress: 4 }),
      createSlice({ appName: "Chrome", clicks: 1, keypress: 1 }),
    ];

    expect(filterTimelineSlices(slices, "focused")).toHaveLength(1);
    expect(filterTimelineSlices(slices, "focused")[0].appName).toBe("VSCode");
  });

  it("idle 숨기기는 비활성 또는 입력 없는 slice를 제외한다", () => {
    const slices = [
      createSlice({ appName: "VSCode", isActive: true, keypress: 1 }),
      createSlice({ appName: "Idle", isActive: false }),
      createSlice({ appName: "Viewer", isActive: true }),
    ];

    expect(filterTimelineSlices(slices, "hide-idle")).toEqual([slices[0]]);
  });

  it("필터별 개수를 계산한다", () => {
    const slices = [
      createSlice({ appName: "VSCode", clicks: 2, keypress: 3 }),
      createSlice({ appName: "Chrome", clicks: 1, keypress: 0 }),
      createSlice({ appName: "Idle", isActive: false }),
    ];

    expect(getTimelineFilterCounts(slices)).toEqual({
      all: 3,
      focused: 1,
      "hide-idle": 2,
    });
  });
});

function createSlice(overrides: Partial<TimelineSlice>): TimelineSlice {
  return {
    start: "2026-08-11T00:00:00.000Z",
    end: "2026-08-11T00:00:01.000Z",
    appName: "VSCode",
    appPath: null,
    bundleId: null,
    windowTitle: "DayGraph",
    isActive: true,
    clicks: 0,
    keypress: 0,
    ...overrides,
  };
}
