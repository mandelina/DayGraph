type Props = {
  trend: Array<{
    appName: string;
    change: number;
    hours: number;
  }>;
};

export function WeeklyTrend({ trend }: Props) {
  return (
    <section className="bg-card rounded-xl p-4">
      <h2 className="text-lg font-semibold mb-4">앱별 주간 추이</h2>
      <div className="space-y-3">
        {trend.map((item) => (
          <div
            key={item.appName}
            className="flex items-center justify-between bg-cardMuted rounded-lg px-4 py-3 border border-border"
          >
            <div>
              <div className="text-sm font-semibold">{item.appName}</div>
              <div className="text-xs text-muted">
                {item.hours.toFixed(1)}h this week
              </div>
            </div>
            <div
              className={`text-sm font-semibold ${
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
