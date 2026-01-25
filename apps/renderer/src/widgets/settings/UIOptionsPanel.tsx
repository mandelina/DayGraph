type Props = {
  options: {
    theme: string;
    density: string;
  };
};

export function UIOptionsPanel({ options }: Props) {
  return (
    <section className="bg-card rounded-xl p-4">
      <h2 className="text-lg font-semibold mb-4">UI / UX</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <OptionCard label="Theme" value={options.theme} />
        <OptionCard label="Layout Density" value={options.density} />
      </div>
    </section>
  );
}

function OptionCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-cardMuted rounded-lg border border-border p-4">
      <div className="text-sm text-muted">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}
