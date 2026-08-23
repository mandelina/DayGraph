import { useMemo } from "react";
import { useActivityRange } from "../../../app/providers/useActivityRange";
import {
  buildWeeklyReport,
  getWeeklyQueryRange,
} from "../../../entities/activity/lib/reports";
import { WeeklySummary } from "../../../widgets/weekly/WeeklySummary";
import { WeeklyTrend } from "../../../widgets/weekly/WeeklyTrend";
import { WeeklyInsights } from "../../../widgets/weekly/WeeklyInsights";

export function WeeklyPage() {
  const range = useMemo(() => getWeeklyQueryRange(), []);
  const { rows, loadState, errorMessage } = useActivityRange(
    range.queryStartISO,
    range.queryEndISO,
  );
  const report = useMemo(
    () => buildWeeklyReport(rows, range.currentStartISO, range.currentEndISO),
    [rows, range.currentStartISO, range.currentEndISO],
  );

  return (
    <>
      <header className="bg-primary text-surface px-4 py-3 rounded-xl flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide font-semibold">
            Weekly
          </div>
          <div className="text-2xl font-bold">이번 주 집중 패턴 요약</div>
        </div>
        <div className="text-sm text-surface/70">패턴 비교</div>
      </header>
      <WeeklyStateNotice loadState={loadState} errorMessage={errorMessage} />
      {report.hasData ? (
        <>
          <WeeklySummary summary={report.dailySummary} />
          <WeeklyTrend trend={report.appTrend} />
          <WeeklyInsights insights={report.insights} />
        </>
      ) : loadState !== "loading" ? (
        <section className="bg-card rounded-xl p-6 text-center text-muted">
          이번 주 활동 데이터가 없습니다.
        </section>
      ) : null}
    </>
  );
}

function WeeklyStateNotice({
  loadState,
  errorMessage,
}: {
  loadState: "loading" | "ready" | "empty" | "error";
  errorMessage: string | null;
}) {
  if (loadState === "loading") {
    return (
      <section className="bg-card rounded-xl p-3 text-sm text-muted">
        주간 활동 데이터를 불러오는 중입니다.
      </section>
    );
  }
  if (loadState === "error") {
    return (
      <section className="bg-card rounded-xl border border-danger/40 p-3 text-sm text-danger">
        주간 활동 데이터를 가져오지 못했습니다.
        {errorMessage ? ` ${errorMessage}` : ""}
      </section>
    );
  }
  return null;
}
