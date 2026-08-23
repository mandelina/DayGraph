import { AppActivity } from "../../entities/activity/model";
import { formatSeconds } from "../../shared/lib/time";
import { AppIcon } from "../../shared/ui/AppIcon";

type Props = {
  apps: AppActivity[];
};

export function RemainingAppsTable({ apps }: Props) {
  if (apps.length === 0) return null;
  return (
    <section className="surface-card h-full p-5 text-foreground sm:p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="eyebrow text-muted">The rest of the story</div>
          <h2 className="mt-2 text-xl font-black tracking-tight">앱별 활동 순위</h2>
        </div>
        <div className="text-xs font-semibold text-muted">{apps.length} apps</div>
      </div>
      <div className="mt-5 space-y-2">
        {apps.map((app, idx) => (
          <article
            key={app.appName}
            className="group flex items-center gap-3 rounded-2xl border border-transparent bg-cardMuted/65 p-3 transition hover:border-border hover:bg-cardMuted"
          >
            <div className="w-6 text-center text-xs font-black text-muted">#{idx + 2}</div>
            <AppIcon
              appName={app.appName}
              appPath={null}
              bundleId={null}
              size={32}
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold">{app.appName}</div>
              <div className="mt-1 text-xs text-muted">
                {formatSeconds(app.activeSeconds)} · {app.clickCount} clicks
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-black text-foreground">{app.score.toFixed(1)}</div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted">score</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
