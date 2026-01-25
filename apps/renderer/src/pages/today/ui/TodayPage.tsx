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
      <header className="bg-yellow-300 text-black px-4 py-3 rounded-xl flex items-center justify-between">
        <div>
          <div className="text-sm uppercase tracking-wide">Today</div>
          <div className="text-2xl font-bold">오늘 집중한 앱</div>
        </div>
        <div className="text-sm text-black/70">
          Activity Intensity Dashboard
        </div>
      </header>
      {hero ? (
        <TopAppHero app={hero} />
      ) : (
        <section className="bg-white/5 rounded-xl p-6 text-center text-white/70">
          오늘 활동 데이터가 없습니다.
        </section>
      )}
      <RemainingAppsTable apps={rest} />
    </>
  );
}
