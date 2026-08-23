type Props = {
  patterns: Array<{
    type: string;
    description: string;
  }>;
};

export function FocusPatternGrid({ patterns }: Props) {
  return (
    <section className="surface-card p-5 sm:p-6">
      <div className="eyebrow text-muted">Pattern library</div>
      <h2 className="mt-2 text-xl font-black tracking-tight">Focus Pattern Analysis</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {patterns.map((pattern) => (
          <article
            key={pattern.type}
            className="rounded-2xl border border-border/70 bg-cardMuted/60 p-4 transition hover:-translate-y-0.5 hover:bg-cardMuted"
          >
            <div className="text-sm font-bold">{pattern.type}</div>
            <p className="mt-2 text-sm leading-6 text-muted">{pattern.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
