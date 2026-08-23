type Props = {
  summary: Array<{
    day: string;
    activeHours: number;
    focusScore: number;
  }>;
};

export function WeeklySummary({ summary }: Props) {
  const maxHours = Math.max(...summary.map((item) => item.activeHours), 1);
  return (
    <section className="surface-card p-5 sm:p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="eyebrow text-muted">Daily pulse</div>
          <h2 className="mt-2 text-xl font-black tracking-tight">요일별 요약</h2>
        </div>
        <div className="text-xs text-muted">active hours</div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
        {summary.map((item) => (
          <div
            key={item.day}
            className="rounded-2xl border border-border/70 bg-cardMuted/60 p-3"
          >
            <div className="text-xs font-bold uppercase tracking-wide text-muted">
              {item.day}
            </div>
            <div className="mt-4 text-xl font-black">
              {item.activeHours.toFixed(1)}h
            </div>
            <div className="mt-1 text-xs text-muted">Focus {item.focusScore}</div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surfaceMuted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.max((item.activeHours / maxHours) * 100, 4)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
