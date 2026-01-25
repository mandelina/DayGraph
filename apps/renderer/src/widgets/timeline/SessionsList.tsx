import { TimelineSlice } from "../../entities/activity/model";
import { formatHour } from "../../shared/lib/time";

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
    <section className="bg-card rounded-xl p-4">
      <h2 className="text-lg font-semibold mb-3">상세 세션</h2>
      <div className="space-y-2">
        {topSessions.map((session) => (
          <div
            key={session.start}
            className="flex items-center justify-between bg-cardMuted rounded-lg px-3 py-2 border border-border"
          >
            <div>
              <div className="text-sm font-semibold text-foreground">
                {session.appName}
              </div>
              <div className="text-xs text-muted truncate max-w-md">
                {session.windowTitle}
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted">
              <span>
                {formatHour(session.start)} – {formatHour(session.end)}
              </span>
              <span>Clicks {session.clicks}</span>
              <span>Keys {session.keypress}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
