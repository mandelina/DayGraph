type Props = {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "warm" | "sage" | "neutral";
};

export function MetricCard({ label, value, hint, tone = "warm" }: Props) {
  return (
    <article className={`metric-card metric-card-${tone}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          {label}
        </span>
        <span className="metric-card-dot" aria-hidden />
      </div>
      <div className="mt-4 text-2xl font-black tracking-tight text-foreground">
        {value}
      </div>
      {hint ? <div className="mt-1 text-xs text-muted">{hint}</div> : null}
    </article>
  );
}
