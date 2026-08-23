type Props = {
  insights: Array<{
    title: string;
    detail: string;
  }>;
};

export function AppBehaviorInsights({ insights }: Props) {
  return (
    <section className="surface-card p-5 sm:p-6">
      <div className="eyebrow text-muted">App behavior</div>
      <h2 className="mt-2 text-xl font-black tracking-tight">App Behavior Insights</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {insights.map((insight) => (
          <div
            key={insight.title}
            className="rounded-2xl border border-border/70 bg-cardMuted/60 p-4"
          >
            <div className="text-sm font-bold">{insight.title}</div>
            <p className="mt-2 text-sm leading-6 text-muted">{insight.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
