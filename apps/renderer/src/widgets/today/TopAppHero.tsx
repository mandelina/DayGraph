import { AppActivity } from "../../entities/activity/model";
import { ACTIVITY_SCORE_WEIGHTS } from "../../entities/activity/lib/calculateScore";
import { formatSeconds } from "../../shared/lib/time";
import { AppIcon } from "../../shared/ui/AppIcon";

type Props = {
  app: AppActivity;
};

export function TopAppHero({ app }: Props) {
  const segments = [
    {
      label: "Active",
      value: app.activeSeconds * ACTIVITY_SCORE_WEIGHTS.active,
      color: "bg-success",
    },
    {
      label: "Clicks",
      value: app.clickCount * ACTIVITY_SCORE_WEIGHTS.clicks,
      color: "bg-accent",
    },
    {
      label: "Keys",
      value: app.keypressCount * ACTIVITY_SCORE_WEIGHTS.keys,
      color: "bg-info",
    },
  ];
  const total = segments.reduce((sum, seg) => sum + seg.value, 0) || 1;

  return (
    <article className="surface-card relative h-full overflow-hidden border-l-4 border-l-primary bg-card p-6 text-foreground shadow-sm sm:p-7">
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="eyebrow text-primary">#1 Today focus</div>
          <div className="mt-4 flex items-center gap-3">
            <AppIcon
              appName={app.appName}
              appPath={app.appPath}
              bundleId={app.bundleId}
              size={48}
            />
            <div className="truncate text-3xl font-black tracking-tight sm:text-4xl">
              {app.appName}
            </div>
          </div>
        </div>
        <div className="shrink-0 rounded-2xl border border-primary/25 bg-primary/10 px-4 py-3 text-right">
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
            Score
          </div>
          <div className="mt-1 text-3xl font-black text-primary sm:text-4xl">
            {app.score.toFixed(1)}
          </div>
        </div>
      </div>
      <div className="relative z-10 mt-8 grid grid-cols-3 gap-2 text-center sm:gap-3">
        <StatCard label="Clicks" value={app.clickCount} />
        <StatCard label="Keys" value={app.keypressCount} />
        <StatCard label="Active Time" value={formatSeconds(app.activeSeconds)} />
      </div>
      <div className="relative z-10 mt-7">
        <div className="mb-2 flex items-center justify-between gap-4">
          <div className="text-xs font-semibold text-muted">점수 구성 비율</div>
          <div className="text-xs text-muted">activity mix</div>
        </div>
        <div className="flex h-3 overflow-hidden rounded-full bg-cardMuted">
          {segments.map((seg) => (
            <div
              key={seg.label}
              className={seg.color}
              style={{ width: `${(seg.value / total) * 100}%` }}
              title={`${seg.label}: ${seg.value.toFixed(1)}`}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-muted">
          {segments.map((seg) => (
            <span key={seg.label}>
              {seg.label}: {((seg.value / total) * 100).toFixed(0)}%
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-cardMuted/75 p-3">
      <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
        {label}
      </div>
      <div className="text-lg font-bold text-foreground sm:text-xl">{value}</div>
    </div>
  );
}
