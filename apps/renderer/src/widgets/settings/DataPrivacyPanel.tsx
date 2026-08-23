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
    <section className="surface-card p-5 sm:p-6">
      <div className="eyebrow text-muted">Local-first</div>
      <h2 className="mt-2 text-xl font-black tracking-tight">데이터 & Privacy</h2>
      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-sm font-bold">데이터 경로</div>
            <div className="mt-1 truncate text-xs text-muted" title={options.dataDir}>
              {options.dataDir}
            </div>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-bold text-accent transition hover:bg-accent/20"
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
    <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-cardMuted/60 px-4 py-3">
      <div className="text-sm font-semibold">{label}</div>
      <div className={`text-xs font-black uppercase tracking-[0.12em] ${enabled ? "text-success" : "text-muted"}`}>
        {enabled ? "ON" : "OFF"}
      </div>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-cardMuted/60 px-4 py-3">
      <div className="text-sm text-muted">{label}</div>
      <div className="truncate text-right text-sm font-bold text-foreground">{value}</div>
    </div>
  );
}
