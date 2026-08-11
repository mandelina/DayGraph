import {
  ActivityLoadState,
  AppActivity,
} from "../../../entities/activity/model";
import { TopAppHero } from "../../../widgets/today/TopAppHero";
import { RemainingAppsTable } from "../../../widgets/today/RemainingAppsTable";

type Props = {
  apps: AppActivity[];
  loadState: ActivityLoadState;
  isUsingMockData: boolean;
  errorMessage: string | null;
};

export function TodayPage({
  apps,
  loadState,
  isUsingMockData,
  errorMessage,
}: Props) {
  const [hero, ...rest] = apps;
  return (
    <>
      <header className="bg-primary text-surface px-4 py-3 rounded-xl flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide font-semibold">
            Today
          </div>
          <div className="text-2xl font-bold">오늘 집중한 앱</div>
        </div>
        <div className="text-sm text-surface/70">
          Activity Intensity Dashboard
        </div>
      </header>
      <ActivityStateNotice
        loadState={loadState}
        isUsingMockData={isUsingMockData}
        errorMessage={errorMessage}
      />
      {hero ? (
        <TopAppHero app={hero} />
      ) : (
        <section className="bg-card rounded-xl p-6 text-center text-muted">
          {loadState === "loading"
            ? "활동 데이터를 불러오는 중입니다."
            : "오늘 활동 데이터가 없습니다."}
        </section>
      )}
      <RemainingAppsTable apps={rest} />
    </>
  );
}

function ActivityStateNotice({
  loadState,
  isUsingMockData,
  errorMessage,
}: {
  loadState: ActivityLoadState;
  isUsingMockData: boolean;
  errorMessage: string | null;
}) {
  if (isUsingMockData) {
    return (
      <section className="bg-card rounded-xl border border-warning/40 p-3 text-sm text-warning">
        목업 데이터를 표시 중입니다.
      </section>
    );
  }
  if (loadState === "error") {
    return (
      <section className="bg-card rounded-xl border border-danger/40 p-3 text-sm text-danger">
        Collector 데이터를 가져오지 못했습니다.
        {errorMessage ? ` ${errorMessage}` : ""}
      </section>
    );
  }
  return null;
}
