type Props = {
  weights: {
    active: number;
    clicks: number;
    keys: number;
  };
};

export function ScoreWeightsPanel({ weights }: Props) {
  return (
    <section className="bg-card rounded-xl p-4">
      <h2 className="text-lg font-semibold mb-4">Activity Score 가중치</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {Object.entries(weights).map(([label, value]) => (
          <div
            key={label}
            className="bg-cardMuted rounded-lg border border-border p-4"
          >
            <div className="text-sm uppercase tracking-wide text-muted">
              {label}
            </div>
            <div className="text-2xl font-semibold">{value.toFixed(1)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
