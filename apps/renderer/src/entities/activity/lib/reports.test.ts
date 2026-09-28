import { describe, expect, it } from "vitest";
import type { QueryRangeSummaryResponse } from "@daygraph/shared/ipc";
import type { Activity } from "../model";
import {
  buildInsightReport,
  buildWeeklyReport,
  calculateFocusScore,
  getWeeklyQueryRange,
} from "./reports";

describe("activity reports", () => {
  it("월요일부터 일요일까지 현재 주와 이전 주 조회 범위를 만든다", () => {
    expect(getWeeklyQueryRange(new Date(2026, 7, 11, 18))).toEqual({
      queryStartISO: "2026-08-03",
      queryEndISO: "2026-08-16",
      currentStartISO: "2026-08-10",
      currentEndISO: "2026-08-16",
    });
  });

  it("현재 주 일별 요약과 이전 주 대비 앱 추이를 계산한다", () => {
    const report = buildWeeklyReport(
      createSummary([
        createActivity("2026-08-03", "VSCode", { clicks: 1 }),
        createActivity("2026-08-10", "VSCode", { clicks: 2 }),
        createActivity("2026-08-11", "Chrome"),
        createActivity("2026-08-12", "Chrome", { is_active: false }),
      ]),
      "2026-08-10",
      "2026-08-16",
    );

    expect(report.hasData).toBe(true);
    expect(report.dailySummary).toHaveLength(7);
    expect(report.dailySummary[0]).toMatchObject({
      dateISO: "2026-08-10",
      activeHours: 1 / 3600,
    });
    expect(report.appTrend).toEqual([
      { appName: "VSCode", hours: 1 / 3600, change: 0 },
      { appName: "Chrome", hours: 1 / 3600, change: 100 },
    ]);
  });

  it("인사이트는 활성 기록만 사용하고 빈 주를 명시한다", () => {
    const empty = buildInsightReport(
      { apps: [], days: [] },
      "2026-08-10",
      "2026-08-16",
    );
    expect(empty).toMatchObject({
      hasData: false,
      summary: { highlight: "이번 주 활동 데이터가 없습니다." },
    });

    const report = buildInsightReport(
      createSummary([
        createActivity("2026-08-10", "VSCode", { clicks: 1 }),
        createActivity("2026-08-10", "Chrome", {
          is_active: false,
          clicks: 50,
          keypress: 50,
        }),
      ]),
      "2026-08-10",
      "2026-08-16",
    );

    expect(report.hasData).toBe(true);
    expect(report.appInsights[0]).toMatchObject({ title: "VSCode" });
    expect(report.summary.context).toContain("입력이 포함된 기록은 전체의 100%였습니다.");
  });

  it("집중 점수에서 비활성 기록을 입력 활동으로 세지 않는다", () => {
    expect(
      calculateFocusScore([
        createActivity("2026-08-10", "VSCode", { clicks: 1 }),
        createActivity("2026-08-10", "Chrome", {
          is_active: false,
          clicks: 100,
          keypress: 100,
        }),
      ]),
    ).toBe(70);
  });
});

function createActivity(
  dateISO: string,
  appName: string,
  overrides: Partial<Activity> = {},
): Activity {
  const [year, month, day] = dateISO.split("-").map(Number);
  return {
    timestamp: new Date(year, month - 1, day, 9).toISOString(),
    app_name: appName,
    app_path: null,
    bundle_id: null,
    window_title: appName,
    display_id: 0,
    is_active: true,
    clicks: 0,
    keypress: 0,
    ...overrides,
  };
}

function createSummary(rows: Activity[]): QueryRangeSummaryResponse {
  const apps = new Map<string, QueryRangeSummaryResponse["apps"][number]>();
  const days = new Map<string, QueryRangeSummaryResponse["days"][number]>();

  for (const row of rows) {
    const dateISO = row.timestamp.slice(0, 10);
    const appKey = `${dateISO}:${row.app_name}`;
    const app = apps.get(appKey) ?? {
      dateISO,
      appName: row.app_name,
      appPath: row.app_path,
      bundleId: row.bundle_id,
      totalRows: 0,
      activeSeconds: 0,
      inputSeconds: 0,
      clickCount: 0,
      keypressCount: 0,
    };
    app.totalRows += 1;
    app.activeSeconds += row.is_active ? 1 : 0;
    app.inputSeconds += row.is_active && row.clicks + row.keypress > 0 ? 1 : 0;
    app.clickCount += row.clicks;
    app.keypressCount += row.keypress;
    apps.set(appKey, app);

    const day = days.get(dateISO) ?? {
      dateISO,
      totalRows: 0,
      activeSeconds: 0,
      inputSeconds: 0,
      appSwitches: 0,
    };
    day.totalRows += 1;
    day.activeSeconds += row.is_active ? 1 : 0;
    day.inputSeconds += row.is_active && row.clicks + row.keypress > 0 ? 1 : 0;
    days.set(dateISO, day);
  }

  return { apps: Array.from(apps.values()), days: Array.from(days.values()) };
}
