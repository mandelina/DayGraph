type Props = {
  insights: Array<{
    title: string;
    detail: string;
  }>;
};

export function AppBehaviorInsights({ insights }: Props) {
  return (
    <section className="bg-card rounded-xl p-4">
      <h2 className="text-lg font-semibold mb-4">App Behavior Insights</h2>
      <div className="space-y-3">
        {insights.map((insight) => (
          <div
            key={insight.title}
            className="bg-cardMuted rounded-lg border border-border p-4"
          >
            <div className="text-sm font-semibold">{insight.title}</div>
            <p className="text-sm text-muted mt-1">{insight.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
