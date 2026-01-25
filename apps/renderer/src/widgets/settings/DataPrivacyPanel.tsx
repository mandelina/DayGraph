type Props = {
  options: {
    dataDir: string;
    collector: boolean;
    iohook: boolean;
  };
};

export function DataPrivacyPanel({ options }: Props) {
  return (
    <section className="bg-card rounded-xl p-4">
      <h2 className="text-lg font-semibold mb-4">데이터 & Privacy</h2>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">데이터 경로</div>
            <div className="text-xs text-muted">{options.dataDir}</div>
          </div>
          <button className="text-sm text-accent">Open</button>
        </div>
        <ToggleRow label="Collector" enabled={options.collector} />
        <ToggleRow label="iohook" enabled={options.iohook} />
      </div>
    </section>
  );
}

function ToggleRow({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between bg-cardMuted rounded-lg px-4 py-2 border border-border">
      <div className="text-sm">{label}</div>
      <div
        className={`text-sm font-semibold ${
          enabled ? "text-success" : "text-muted"
        }`}
      >
        {enabled ? "ON" : "OFF"}
      </div>
    </div>
  );
}
