type Props = {
  weights: {
    active: number;
    clicks: number;
    keys: number;
  };
};

export function ScoreWeightsPanel({ weights }: Props) {
  return (
    <section className="surface-card p-5 sm:p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="eyebrow text-muted">Scoring model</div>
          <h2 className="mt-2 text-xl font-black tracking-tight">Activity Score 가중치</h2>
        </div>
        <div className="text-xs text-muted">read-only</div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {Object.entries(weights).map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-border/70 bg-cardMuted/60 p-4"
          >
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
              {label}
            </div>
            <div className="mt-3 text-3xl font-black">{value.toFixed(1)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
