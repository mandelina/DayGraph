import {
  ActivityLoadState,
  AppActivity,
} from "../../../entities/activity/model";
import type { CollectorStatusResponse } from "@daygraph/shared/ipc";
import { getCollectorStatusIssue } from "../../../app/providers/useCollectorStatus";
import { TopAppHero } from "../../../widgets/today/TopAppHero";
import { RemainingAppsTable } from "../../../widgets/today/RemainingAppsTable";
import { PageHeader } from "../../../shared/ui/PageHeader";
import { MetricCard } from "../../../shared/ui/MetricCard";
import { formatSeconds } from "../../../shared/lib/time";

type Props = {
  apps: AppActivity[];
  loadState: ActivityLoadState;
  isUsingMockData: boolean;
  errorMessage: string | null;
  collectorStatus: CollectorStatusResponse | null;
};

export function TodayPage({
  apps,
  loadState,
  isUsingMockData,
  errorMessage,
  collectorStatus,
}: Props) {
  const [hero, ...rest] = apps;
  const totalActiveSeconds = apps.reduce(
    (total, app) => total + app.activeSeconds,
    0,
  );
  const totalClicks = apps.reduce((total, app) => total + app.clickCount, 0);
  const totalKeypress = apps.reduce(
    (total, app) => total + app.keypressCount,
    0,
  );
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Today / Focus overview"
        title="오늘 집중한 앱"
        description="오늘 기록된 앱별 활동 시간과 상호작용을 확인합니다."
        meta={<>Today<br />Activity</>}
        tone="warm"
      />
      <ActivityStateNotice
        loadState={loadState}
        isUsingMockData={isUsingMockData}
        errorMessage={errorMessage}
        collectorStatus={collectorStatus}
      />
      {hero ? (
        <>
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricCard
              label="Active time"
              value={formatSeconds(totalActiveSeconds)}
              hint="수집된 전체 활동"
              tone="warm"
            />
            <MetricCard
              label="Apps"
              value={apps.length}
              hint="오늘 기록된 앱"
              tone="sage"
            />
            <MetricCard
              label="Clicks"
              value={totalClicks}
              hint="마우스 상호작용"
              tone="neutral"
            />
            <MetricCard
              label="Keypress"
              value={totalKeypress}
              hint="키보드 상호작용"
              tone="sage"
            />
          </section>
          <section className="grid gap-5 xl:grid-cols-5">
            <div className="xl:col-span-3">
              <TopAppHero app={hero} />
            </div>
            <div className="xl:col-span-2">
              <RemainingAppsTable apps={rest} />
            </div>
          </section>
        </>
      ) : (
        <section className="surface-card flex min-h-64 flex-col items-center justify-center p-8 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-cardMuted text-2xl text-muted">
            ◌
          </div>
          <div className="mt-4 text-lg font-bold text-foreground">
            {loadState === "loading"
              ? "활동 데이터를 불러오는 중입니다."
              : "오늘 활동 데이터가 없습니다."}
          </div>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
            Collector가 실행되면 앱별 활동과 집중 점수가 이곳에 쌓입니다.
          </p>
        </section>
      )}
    </div>
  );
}

function ActivityStateNotice({
  loadState,
  isUsingMockData,
  errorMessage,
  collectorStatus,
}: {
  loadState: ActivityLoadState;
  isUsingMockData: boolean;
  errorMessage: string | null;
  collectorStatus: CollectorStatusResponse | null;
}) {
  if (isUsingMockData) {
    return (
      <section className="status-banner status-banner-warning">
        <span className="status-banner-dot" aria-hidden />
        <span>목업 데이터를 표시 중입니다.</span>
      </section>
    );
  }
  if (loadState === "error") {
    return (
      <section className="status-banner status-banner-danger">
        <span className="status-banner-dot" aria-hidden />
        <span>
          Collector 데이터를 가져오지 못했습니다.
          {errorMessage ? ` ${errorMessage}` : ""}
        </span>
      </section>
    );
  }
  const issue = getCollectorStatusIssue(collectorStatus);
  if (issue) {
    return (
      <section className="status-banner status-banner-warning">
        <span className="status-banner-dot" aria-hidden />
        <span>Collector가 일부 기능을 사용할 수 없습니다. {issue}</span>
      </section>
    );
  }
  return null;
}
