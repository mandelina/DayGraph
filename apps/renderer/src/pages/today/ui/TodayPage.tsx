import { AppActivity } from "../../../entities/activity/model";
import { TopAppHero } from "../../../widgets/today/TopAppHero";
import { RemainingAppsTable } from "../../../widgets/today/RemainingAppsTable";

type Props = {
  apps: AppActivity[];
};

export function TodayPage({ apps }: Props) {
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
      {hero ? (
        <TopAppHero app={hero} />
      ) : (
        <section className="bg-card rounded-xl p-6 text-center text-muted">
          오늘 활동 데이터가 없습니다.
        </section>
      )}
      <RemainingAppsTable apps={rest} />
    </>
  );
}
