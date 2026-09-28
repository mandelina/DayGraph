import type {
  ActivitySummaryAppRow,
  ActivitySummaryDayRow,
  QueryRangeSummaryResponse,
} from "@daygraph/shared/ipc";
import type { Activity } from "../model";
import { ACTIVITY_SCORE_WEIGHTS } from "./calculateScore";
import { formatLocalDateISO } from "../../../shared/lib/time";

export type WeeklyDaySummary = {
  day: string;
  dateISO: string;
  activeHours: number;
  focusScore: number;
};

export type WeeklyAppTrend = {
  appName: string;
  change: number;
  hours: number;
};

export type WeeklyInsight = {
  title: string;
  description: string;
};

export type WeeklyReport = {
  dailySummary: WeeklyDaySummary[];
  appTrend: WeeklyAppTrend[];
  insights: WeeklyInsight[];
  hasData: boolean;
};

export type InsightReport = {
  summary: {
    highlight: string;
    context: string;
  };
  patterns: Array<{
    type: string;
    description: string;
  }>;
  appInsights: Array<{
    title: string;
    detail: string;
  }>;
  hasData: boolean;
};

export type WeeklyQueryRange = {
  queryStartISO: string;
  queryEndISO: string;
  currentStartISO: string;
  currentEndISO: string;
};

export function getWeeklyQueryRange(reference = new Date()): WeeklyQueryRange {
  const currentDate = new Date(
    reference.getFullYear(),
    reference.getMonth(),
    reference.getDate(),
    12,
  );
  const day = currentDate.getDay() || 7;
  const currentStart = addDays(currentDate, 1 - day);
  const currentEnd = addDays(currentStart, 6);
  const previousStart = addDays(currentStart, -7);

  return {
    queryStartISO: formatLocalDateISO(previousStart),
    queryEndISO: formatLocalDateISO(currentEnd),
    currentStartISO: formatLocalDateISO(currentStart),
    currentEndISO: formatLocalDateISO(currentEnd),
  };
}

export function buildWeeklyReport(
  summary: QueryRangeSummaryResponse,
  currentStartISO: string,
  currentEndISO: string,
): WeeklyReport {
  const previousStartISO = formatLocalDateISO(
    addDays(parseLocalDate(currentStartISO), -7),
  );
  const previousEndISO = formatLocalDateISO(
    addDays(parseLocalDate(currentEndISO), -7),
  );
  const days = listDates(currentStartISO, currentEndISO);
  const dailySummary = days.map((dateISO) => {
    const dayRows = summary.days.find((row) => row.dateISO === dateISO);
    return {
      day: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(
        parseLocalDate(dateISO),
      ),
      dateISO,
      activeHours: (dayRows?.activeSeconds ?? 0) / 3600,
      focusScore: calculateSummaryFocusScore(dayRows),
    };
  });

  const currentApps = summarizeSummaryApps(
    summary.apps.filter((row) =>
      isDateInRange(row.dateISO, currentStartISO, currentEndISO),
    ),
  );
  const previousApps = summarizeSummaryApps(
    summary.apps.filter((row) =>
      isDateInRange(row.dateISO, previousStartISO, previousEndISO),
    ),
  );
  const previousByName = new Map(
    previousApps.map((app) => [app.appName, app.activeSeconds]),
  );
  const appTrend = currentApps
    .slice(0, 5)
    .map((app) => {
      const previousSeconds = previousByName.get(app.appName) ?? 0;
      return {
        appName: app.appName,
        hours: app.activeSeconds / 3600,
        change:
          previousSeconds === 0
            ? app.activeSeconds > 0
              ? 100
              : 0
            : Math.round(
                ((app.activeSeconds - previousSeconds) / previousSeconds) *
                  100,
              ),
      };
    });

  const populatedDays = dailySummary.filter((item) => item.activeHours > 0);
  const insights: WeeklyInsight[] = [];
  if (populatedDays.length > 0) {
    const focusedDay = [...populatedDays].sort(
      (a, b) => b.focusScore - a.focusScore,
    )[0];
    const distractedDay = [...populatedDays].sort(
      (a, b) => a.focusScore - b.focusScore,
    )[0];
    insights.push({
      title: "가장 집중된 요일",
      description: `${focusedDay.day}에 ${focusedDay.activeHours.toFixed(
        1,
      )}시간 활동했고 집중 지표는 ${focusedDay.focusScore}점입니다.`,
    });
    insights.push({
      title: "주의가 필요한 요일",
      description: `${distractedDay.day}의 입력이 있는 활동 비율이 상대적으로 낮습니다.`,
    });
  }
  if (appTrend.length > 0) {
    insights.push({
      title: "앱 사용 패턴",
      description: `${appTrend[0].appName}이 이번 주 활동 시간 ${appTrend[0].hours.toFixed(
        1,
      )}시간으로 가장 많습니다.`,
    });
  }

  return {
    dailySummary,
    appTrend,
    insights,
    hasData: summary.days.some(
      (row) =>
        isDateInRange(row.dateISO, currentStartISO, currentEndISO) &&
        row.activeSeconds > 0,
    ),
  };
}

export function buildInsightReport(
  summary: QueryRangeSummaryResponse,
  currentStartISO: string,
  currentEndISO: string,
): InsightReport {
  const currentDays = summary.days.filter((row) =>
    isDateInRange(row.dateISO, currentStartISO, currentEndISO),
  );
  const activeSeconds = currentDays.reduce(
    (total, row) => total + row.activeSeconds,
    0,
  );
  if (activeSeconds === 0) {
    return {
      summary: { highlight: "이번 주 활동 데이터가 없습니다.", context: "" },
      patterns: [],
      appInsights: [],
      hasData: false,
    };
  }

  const daily = listDates(currentStartISO, currentEndISO).map((dateISO) => ({
    dateISO,
    score: calculateSummaryFocusScore(
      currentDays.find((row) => row.dateISO === dateISO),
    ),
  }));
  const strongestDay = [...daily].sort((a, b) => b.score - a.score)[0];
  const appStats = summarizeSummaryApps(
    summary.apps.filter((row) =>
      isDateInRange(row.dateISO, currentStartISO, currentEndISO),
    ),
  );
  const topApp = appStats[0];
  const inputSeconds = currentDays.reduce(
    (total, row) => total + row.inputSeconds,
    0,
  );
  const inputRate = Math.round((inputSeconds / activeSeconds) * 100);
  const switches = currentDays.reduce((total, row) => total + row.appSwitches, 0);

  return {
    summary: {
      highlight: `${formatInsightDate(strongestDay.dateISO)}의 활동 입력 비율이 ${
        strongestDay.score
      }점으로 가장 높았습니다.`,
      context: `${topApp?.appName ?? "가장 많이 사용한 앱"}이 ${formatSeconds(
        topApp?.activeSeconds ?? 0,
      )} 활동했고, 입력이 포함된 기록은 전체의 ${inputRate}%였습니다.`,
    },
    patterns: [
      {
        type: "주요 활동 앱",
        description: `${topApp?.appName ?? "없음"}이 전체 활동 시간의 ${Math.round(
            ((topApp?.activeSeconds ?? 0) / Math.max(activeSeconds, 1)) *
            100,
        )}%를 차지합니다.`,
      },
      {
        type: "입력 밀도",
        description: `클릭 또는 키 입력이 포함된 초가 ${inputRate}%입니다.`,
      },
      {
        type: "컨텍스트 전환",
        description: `앱 전환이 ${switches}회 감지되었습니다.`,
      },
    ],
    appInsights: appStats.slice(0, 3).map((app) => ({
      title: app.appName,
      detail: `${formatSeconds(app.activeSeconds)} 활동, 클릭 ${app.clickCount}회, 키 입력 ${app.keypressCount}회로 점수 ${app.score.toFixed(
        1,
      )}입니다.`,
    })),
    hasData: true,
  };
}

function summarizeSummaryApps(rows: ActivitySummaryAppRow[]) {
  const map = new Map<string, AppActivitySummary>();
  for (const row of rows) {
    if (row.activeSeconds === 0) continue;
    const current = map.get(row.appName) ?? {
      appName: row.appName,
      appPath: row.appPath,
      bundleId: row.bundleId,
      activeSeconds: 0,
      clickCount: 0,
      keypressCount: 0,
      score: 0,
    };
    current.appPath ??= row.appPath;
    current.bundleId ??= row.bundleId;
    current.activeSeconds += row.activeSeconds;
    current.clickCount += row.clickCount;
    current.keypressCount += row.keypressCount;
    map.set(row.appName, current);
  }

  return Array.from(map.values())
    .map((entry) => ({
      ...entry,
      score: Number(
        (
          entry.activeSeconds * ACTIVITY_SCORE_WEIGHTS.active +
          entry.clickCount * ACTIVITY_SCORE_WEIGHTS.clicks +
          entry.keypressCount * ACTIVITY_SCORE_WEIGHTS.keys
        ).toFixed(1),
      ),
    }))
    .sort((a, b) => b.score - a.score);
}

type AppActivitySummary = {
  appName: string;
  appPath: string | null;
  bundleId: string | null;
  activeSeconds: number;
  clickCount: number;
  keypressCount: number;
  score: number;
};

function calculateSummaryFocusScore(row: ActivitySummaryDayRow | undefined) {
  if (!row || row.totalRows === 0) return 0;
  const activeRate = row.activeSeconds / row.totalRows;
  const inputRate = row.inputSeconds / Math.max(row.activeSeconds, 1);
  return Math.round(activeRate * 60 + inputRate * 40);
}

export function calculateFocusScore(rows: Activity[]) {
  if (rows.length === 0) return 0;
  const activeRows = rows.filter((row) => row.is_active);
  const inputRows = activeRows.filter(
    (row) => row.clicks + row.keypress > 0,
  );
  const activeRate = activeRows.length / rows.length;
  const inputRate = inputRows.length / Math.max(activeRows.length, 1);
  return Math.round(activeRate * 60 + inputRate * 40);
}

function isDateInRange(dateISO: string, startISO: string, endISO: string) {
  return dateISO >= startISO && dateISO <= endISO;
}

function listDates(startISO: string, endISO: string) {
  const dates: string[] = [];
  let current = parseLocalDate(startISO);
  const end = parseLocalDate(endISO);
  while (current <= end) {
    dates.push(formatLocalDateISO(current));
    current = addDays(current, 1);
  }
  return dates;
}

function parseLocalDate(dateISO: string) {
  const [year, month, day] = dateISO.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

function addDays(date: Date, amount: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function formatInsightDate(dateISO: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).format(parseLocalDate(dateISO));
}

function formatSeconds(seconds: number) {
  if (seconds < 60) return `${seconds}초`;
  return `${Math.floor(seconds / 60)}분 ${seconds % 60}초`;
}
