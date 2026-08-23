import { TimelineSlice } from "../../entities/activity/model";
import { formatHour } from "../../shared/lib/time";
import { AppIcon } from "../../shared/ui/AppIcon";

type Props = {
  slices: TimelineSlice[];
};

export function TimelineSessionsList({ slices }: Props) {
  const topSessions = [...slices]
    .sort(
      (a, b) =>
        b.clicks + b.keypress + (b.isActive ? 5 : 0) -
        (a.clicks + a.keypress + (a.isActive ? 5 : 0)),
    )
    .slice(0, 6);

  return (
    <section className="surface-card p-5 sm:p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="eyebrow text-muted">Selected moments</div>
          <h2 className="mt-2 text-xl font-black tracking-tight">상세 세션</h2>
        </div>
        <div className="text-xs text-muted">상호작용이 많은 순</div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {topSessions.map((session) => (
          <div
            key={session.start}
            className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-border/70 bg-cardMuted/60 p-3 transition hover:-translate-y-0.5 hover:bg-cardMuted"
          >
            <div className="flex min-w-0 items-center gap-3">
              <AppIcon
                appName={session.appName}
                appPath={session.appPath}
                bundleId={session.bundleId}
                size={28}
              />
              <div className="min-w-0">
              <div className="truncate text-sm font-bold text-foreground">
                {session.appName}
              </div>
              <div className="mt-1 truncate text-xs text-muted">
                {session.windowTitle}
              </div>
              </div>
            </div>
            <div className="shrink-0 text-right text-[11px] text-muted">
              <div className="font-bold text-foreground">
                {formatHour(session.start)} – {formatHour(session.end)}
              </div>
              <div className="mt-1">{session.clicks} clicks · {session.keypress} keys</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
