import { useEffect, useState, useMemo } from "react";
import {
  Activity,
  TimelineSlice,
  AppActivity,
} from "../../entities/activity/model";
import { summarizeByApp } from "../../entities/activity/lib/calculateScore";

/**
 * Today 페이지에서 Activity Score 요약 데이터를 불러온다.
 * IPC 호출 결과를 우선 적용하고, 실패 시 mock 데이터를 사용한다.
 */
export function useTodayData(): AppActivity[] {
  const pollingInterval = 5 * 1000;
  const [stats, setStats] = useState<AppActivity[]>([]);

  useEffect(() => {
    const todayISO = new Date().toISOString().slice(0, 10);

    const fetchDay = () => {
      window.api
        ?.queryDay(todayISO)
        ?.then((res: unknown) => {
          if (Array.isArray(res)) {
            console.log("[Today] queryDay result rows", res.length);
            setStats(summarizeByApp(res as Activity[]));
          } else {
            console.warn("[Today] queryDay malformed response", res);
            setStats([]);
          }
        })
        .catch((err) => {
          console.error("[Today] queryDay failed", err);
          setStats([]);
        });
    };

    fetchDay();
    const interval = setInterval(fetchDay, pollingInterval);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return stats.length > 0 ? stats : summarizeByApp(generateMock());
}

/**
 * Collector가 비활성화된 환경에서도 UI를 확인할 수 있도록 1분 분량 목업 데이터를 생성한다.
 */
function generateMock(): Activity[] {
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
