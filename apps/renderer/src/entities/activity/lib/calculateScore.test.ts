import { describe, expect, it } from "vitest";
import { summarizeByApp } from "./calculateScore";
import type { Activity } from "../model";

describe("summarizeByApp", () => {
  it("앱별 활동을 합산하고 점수순으로 정렬한다", () => {
    const rows: Activity[] = [
      createActivity({ app_name: "Chrome", clicks: 1, keypress: 2 }),
      createActivity({ app_name: "VSCode", clicks: 3, keypress: 4 }),
      createActivity({ app_name: "VSCode", clicks: 2, keypress: 6 }),
    ];

    const result = summarizeByApp(rows);

    expect(result).toEqual([
      {
        appName: "VSCode",
        appPath: null,
        bundleId: null,
        activeSeconds: 2,
        clickCount: 5,
        keypressCount: 10,
        score: 17,
      },
      {
        appName: "Chrome",
        appPath: null,
        bundleId: null,
        activeSeconds: 1,
        clickCount: 1,
        keypressCount: 2,
        score: 4,
      },
    ]);
  });

  it("비활성 기록은 앱 활동 점수에서 제외한다", () => {
    const result = summarizeByApp([
      createActivity({
        app_name: "Chrome",
        is_active: false,
        clicks: 100,
        keypress: 100,
      }),
    ]);

    expect(result).toEqual([]);
  });

  it("앱 아이콘 조회에 필요한 경로와 bundle id를 보존한다", () => {
    const result = summarizeByApp([
      createActivity({
        app_name: "Chrome",
        app_path: null,
        bundle_id: null,
      }),
      createActivity({
        app_name: "Chrome",
        app_path: "/Applications/Google Chrome.app",
        bundle_id: "com.google.Chrome",
      }),
    ]);

    expect(result[0]).toMatchObject({
      appPath: "/Applications/Google Chrome.app",
      bundleId: "com.google.Chrome",
    });
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
