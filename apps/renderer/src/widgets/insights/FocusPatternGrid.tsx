type Props = {
  patterns: Array<{
    type: string;
    description: string;
  }>;
};

export function FocusPatternGrid({ patterns }: Props) {
  return (
    <section className="bg-card rounded-xl p-4">
      <h2 className="text-lg font-semibold mb-4">Focus Pattern Analysis</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {patterns.map((pattern) => (
          <article
            key={pattern.type}
            className="bg-cardMuted rounded-lg border border-border p-4"
          >
            <div className="text-sm font-semibold">{pattern.type}</div>
            <p className="text-sm text-muted mt-2">{pattern.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
