type Props = {
  trend: Array<{
    appName: string;
    change: number;
    hours: number;
  }>;
};

export function WeeklyTrend({ trend }: Props) {
  return (
    <section className="surface-card p-5 sm:p-6">
      <div className="eyebrow text-muted">App movement</div>
      <h2 className="mt-2 text-xl font-black tracking-tight">앱별 주간 추이</h2>
      <div className="mt-5 space-y-3">
        {trend.map((item) => (
          <div
            key={item.appName}
            className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-cardMuted/60 px-4 py-3"
          >
            <div>
              <div className="text-sm font-bold">{item.appName}</div>
              <div className="mt-1 text-xs text-muted">
                {item.hours.toFixed(1)}h this week
              </div>
            </div>
            <div
              className={`rounded-full px-2.5 py-1 text-xs font-black ${
                item.change >= 0 ? "text-success" : "text-danger"
              }`}
            >
              {item.change >= 0 ? "+" : ""}
              {item.change}%
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
