type Props = {
  summary: Array<{
    day: string;
    activeHours: number;
    focusScore: number;
  }>;
};

export function WeeklySummary({ summary }: Props) {
  return (
    <section className="bg-card rounded-xl p-4">
      <h2 className="text-lg font-semibold mb-4">요일별 요약</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summary.map((item) => (
          <div
            key={item.day}
            className="bg-cardMuted rounded-lg p-3 border border-border"
          >
            <div className="text-xs text-muted uppercase tracking-wide">
              {item.day}
            </div>
            <div className="text-xl font-semibold">
              {item.activeHours.toFixed(1)}h
            </div>
            <div className="text-sm text-muted">Focus {item.focusScore}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
