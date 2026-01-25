type Props = {
  insights: Array<{
    title: string;
    description: string;
  }>;
};

export function WeeklyInsights({ insights }: Props) {
  return (
    <section className="bg-card rounded-xl p-4">
      <h2 className="text-lg font-semibold mb-4">주간 인사이트</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {insights.map((insight) => (
          <article
            key={insight.title}
            className="bg-cardMuted rounded-lg border border-border p-4"
          >
            <div className="text-sm font-semibold">{insight.title}</div>
            <p className="text-sm text-muted mt-1">{insight.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
