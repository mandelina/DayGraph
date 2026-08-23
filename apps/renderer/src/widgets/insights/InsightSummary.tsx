type Props = {
  summary: {
    highlight: string;
    context: string;
  };
};

export function InsightSummary({ summary }: Props) {
  return (
    <section className="surface-card relative overflow-hidden bg-gradient-to-br from-accent/20 via-card to-card p-6 sm:p-7">
      <div className="eyebrow text-accentSoft">The short version</div>
      <h2 className="mt-2 text-xl font-black tracking-tight">Activity Summary</h2>
      <p className="mt-5 max-w-2xl text-xl font-black leading-8 text-foreground sm:text-2xl">
        {summary.highlight}
      </p>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{summary.context}</p>
      <div className="pointer-events-none absolute -bottom-16 -right-10 h-40 w-40 rounded-full border border-accent/25" />
    </section>
  );
}
