type Props = {
  status: {
    collector: string;
    lastSync: string;
    autoUpdate: string;
    inputBackend: string;
    displayBackend: string;
    activeWindowBackend: string;
    dataQuality: string;
    error: string | null;
  };
};

export function SystemStatusPanel({ status }: Props) {
  return (
    <section className="surface-card p-5 sm:p-6">
      <div className="eyebrow text-muted">Runtime health</div>
      <h2 className="mt-2 text-xl font-black tracking-tight">시스템 상태</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <StatusRow label="Collector" value={status.collector} />
        <StatusRow label="마지막 동기화" value={status.lastSync} />
        <StatusRow label="Auto-update" value={status.autoUpdate} />
        <StatusRow label="Input backend" value={status.inputBackend} />
        <StatusRow label="Display backend" value={status.displayBackend} />
        <StatusRow
          label="Active window backend"
          value={status.activeWindowBackend}
        />
        <StatusRow label="Data quality" value={status.dataQuality} />
        {status.error ? <StatusRow label="상태 메시지" value={status.error} /> : null}
      </div>
    </section>
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
