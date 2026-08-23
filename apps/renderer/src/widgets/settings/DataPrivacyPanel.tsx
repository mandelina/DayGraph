type Props = {
  options: {
    dataDir: string;
    collector: boolean;
    inputBackend: string;
    activeWindowBackend: string;
  };
  openError: string | null;
  onOpenDataDir: () => void;
};

export function DataPrivacyPanel({
  options,
  openError,
  onOpenDataDir,
}: Props) {
  return (
    <section className="bg-card rounded-xl p-4">
      <h2 className="text-lg font-semibold mb-4">데이터 & Privacy</h2>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-sm font-semibold">데이터 경로</div>
            <div className="text-xs text-muted truncate" title={options.dataDir}>
              {options.dataDir}
            </div>
          </div>
          <button
            type="button"
            className="text-sm text-accent shrink-0"
            onClick={onOpenDataDir}
          >
            Open
          </button>
        </div>
        {openError ? <div className="text-xs text-danger">{openError}</div> : null}
        <ToggleRow label="Collector" enabled={options.collector} />
        <StatusRow label="Input backend" value={options.inputBackend} />
        <StatusRow
          label="Active window backend"
          value={options.activeWindowBackend}
        />
      </div>
    </section>
  );
}

function ToggleRow({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between bg-cardMuted rounded-lg px-4 py-2 border border-border">
      <div className="text-sm">{label}</div>
      <div className={`text-sm font-semibold ${enabled ? "text-success" : "text-muted"}`}>
        {enabled ? "ON" : "OFF"}
      </div>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between bg-cardMuted rounded-lg px-4 py-2 border border-border">
      <div className="text-sm text-muted">{label}</div>
      <div className="text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}
