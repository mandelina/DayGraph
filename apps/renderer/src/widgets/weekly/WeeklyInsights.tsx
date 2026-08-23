type Props = {
  insights: Array<{
    title: string;
    description: string;
  }>;
};

export function WeeklyInsights({ insights }: Props) {
  return (
    <section className="surface-card p-5 sm:p-6">
      <div className="eyebrow text-muted">Small observations</div>
      <h2 className="mt-2 text-xl font-black tracking-tight">주간 인사이트</h2>
      <div className="mt-5 grid gap-3">
        {insights.map((insight) => (
          <article
            key={insight.title}
            className="rounded-2xl border border-border/70 bg-cardMuted/60 p-4"
          >
            <div className="text-sm font-bold">{insight.title}</div>
            <p className="mt-2 text-sm leading-6 text-muted">{insight.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
