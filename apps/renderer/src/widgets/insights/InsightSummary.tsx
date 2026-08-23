type Props = {
  summary: {
    highlight: string;
    context: string;
  };
};

export function InsightSummary({ summary }: Props) {
  return (
    <section className="surface-card border-l-4 border-l-accent p-6 sm:p-7">
      <div className="eyebrow text-accentSoft">Summary</div>
      <h2 className="mt-2 text-xl font-black tracking-tight">Activity Summary</h2>
      <p className="mt-5 max-w-2xl text-xl font-black leading-8 text-foreground sm:text-2xl">
        {summary.highlight}
      </p>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{summary.context}</p>
    </section>
  );
}
