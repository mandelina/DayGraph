type Props = {
  options: {
    theme: string;
    density: string;
  };
};

export function UIOptionsPanel({ options }: Props) {
  return (
    <section className="surface-card p-5 sm:p-6">
      <div className="eyebrow text-muted">Personal comfort</div>
      <h2 className="mt-2 text-xl font-black tracking-tight">UI / UX</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <OptionCard label="Theme" value={options.theme} />
        <OptionCard label="Layout Density" value={options.density} />
      </div>
    </section>
  );
}

function OptionCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-cardMuted/60 p-4">
      <div className="text-xs font-bold uppercase tracking-[0.14em] text-muted">{label}</div>
      <div className="mt-3 text-xl font-black">{value}</div>
    </div>
  );
}
