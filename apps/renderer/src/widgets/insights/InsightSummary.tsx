type Props = {
  summary: {
    highlight: string;
    context: string;
  };
};

export function InsightSummary({ summary }: Props) {
  return (
    <section className="bg-card rounded-xl p-4">
      <h2 className="text-lg font-semibold mb-3">AI Summary</h2>
      <p className="text-base font-semibold text-foreground mb-2">
        {summary.highlight}
      </p>
      <p className="text-sm text-muted">{summary.context}</p>
    </section>
  );
}
