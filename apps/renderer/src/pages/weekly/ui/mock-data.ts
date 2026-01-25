type DailySummary = {
  day: string;
  activeHours: number;
  focusScore: number;
};

type AppTrend = {
  appName: string;
  change: number;
  hours: number;
};

type InsightItem = {
  title: string;
  description: string;
};

export function WeeklyMockData() {
  const dailySummary: DailySummary[] = [
    { day: "Mon", activeHours: 6.2, focusScore: 78 },
    { day: "Tue", activeHours: 5.4, focusScore: 71 },
    { day: "Wed", activeHours: 7.1, focusScore: 82 },
    { day: "Thu", activeHours: 4.6, focusScore: 63 },
    { day: "Fri", activeHours: 6.8, focusScore: 79 },
    { day: "Sat", activeHours: 2.4, focusScore: 40 },
    { day: "Sun", activeHours: 1.8, focusScore: 35 },
  ];

  const appTrend: AppTrend[] = [
    { appName: "VSCode", change: 12, hours: 14.3 },
    { appName: "Chrome", change: -5, hours: 10.2 },
    { appName: "Notion", change: 8, hours: 6.1 },
    { appName: "Terminal", change: 3, hours: 4.9 },
  ];

  const insights: InsightItem[] = [
    {
      title: "가장 집중된 요일",
      description: "수요일이 Active Time 7.1h, Focus 82점으로 최고.",
    },
    {
      title: "산만했던 요일",
      description: "목요일에 집중도 급감(63점). 회의/콜이 많은 날과 겹침.",
    },
    {
      title: "앱 사용 패턴",
      description:
        "VSCode + Notion을 번갈아 사용하는 구간에서 클릭/키 입력 비율이 높음.",
    },
  ];

  return { dailySummary, appTrend, insights };
}
