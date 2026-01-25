import { AppActivity } from "../../entities/activity/model";
import { formatSeconds } from "../../shared/lib/time";

const ACTIVE_WEIGHT = 1;
const CLICK_WEIGHT = 2;
const KEYPRESS_WEIGHT = 0.5;

type Props = {
  app: AppActivity;
};

export function TopAppHero({ app }: Props) {
  const segments = [
    {
      label: "Active",
      value: app.activeSeconds * ACTIVE_WEIGHT,
      color: "bg-emerald-400",
    },
    {
      label: "Clicks",
      value: app.clickCount * CLICK_WEIGHT,
      color: "bg-sky-400",
    },
    {
      label: "Keys",
      value: app.keypressCount * KEYPRESS_WEIGHT,
      color: "bg-fuchsia-400",
    },
  ];
  const total = segments.reduce((sum, seg) => sum + seg.value, 0) || 1;

  return (
    <article className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white rounded-2xl p-6 shadow-2xl border border-white/10 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs uppercase tracking-wide text-white/60">
            #1 Today Focus
          </span>
          <div className="text-3xl font-bold mt-1">{app.appName}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/60">Activity Score</div>
          <div className="text-4xl font-black text-amber-300">
            {app.score.toFixed(1)}
          </div>
          <div className="text-xs text-white/60 mt-1">
            Active {formatSeconds(app.activeSeconds)}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <StatCard label="Clicks" value={app.clickCount} />
        <StatCard label="Keys" value={app.keypressCount} />
        <StatCard label="Active Time" value={formatSeconds(app.activeSeconds)} />
      </div>
      <div>
        <div className="text-xs text-white/60 mb-2">점수 구성 비율</div>
        <div className="flex h-3 overflow-hidden rounded-full bg-white/10">
          {segments.map((seg) => (
            <div
              key={seg.label}
              className={seg.color}
              style={{ width: `${(seg.value / total) * 100}%` }}
              title={`${seg.label}: ${seg.value.toFixed(1)}`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-white/60 mt-1">
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
    <div className="bg-white/5 rounded-lg p-3">
      <div className="text-xs text-white/60 mb-1">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}
