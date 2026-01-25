import { useMemo } from "react";
import {
  Activity,
  TimelineSlice,
} from "../../entities/activity/model";

export function useTodayMock(): Activity[] {
  return useMemo(() => {
    const now = Date.now();
    return Array.from({ length: 60 }, (_, idx) => {
      const timestamp = new Date(now - (59 - idx) * 1000).toISOString();
      return {
        timestamp,
        app_name: idx % 2 === 0 ? "VSCode" : "Chrome",
        window_title: idx % 2 === 0 ? "main.ts — DayGraph" : "Docs — DayGraph",
        display_id: idx % 3 === 0 ? 0 : 1,
        clicks: (idx % 5) + 1,
        keypress: (idx % 7) + 2,
      };
    });
  }, []);
}

export function useTimelineMock(): TimelineSlice[] {
  return useMemo(() => {
    const base = new Date();
    const slices: TimelineSlice[] = [];
    const apps = [
      { name: "VSCode", title: "refactor.ts — DayGraph" },
      { name: "Chrome", title: "Docs — Productivity" },
      { name: "Notion", title: "Task HQ" },
      { name: "Terminal", title: "pnpm dev — DayGraph" },
    ];
    for (let i = 0; i < 24; i++) {
      const app = apps[i % apps.length];
      const start = new Date(base.getTime() - (24 - i) * 30 * 60 * 1000);
      const end = new Date(start.getTime() + 30 * 60 * 1000);
      slices.push({
        start: start.toISOString(),
        end: end.toISOString(),
        appName: app.name,
        windowTitle: app.title,
        isActive: i % 5 !== 0,
        clicks: (i % 4) * 3 + 2,
        keypress: (i % 3) * 4 + 1,
      });
    }
    return slices;
  }, []);
}
