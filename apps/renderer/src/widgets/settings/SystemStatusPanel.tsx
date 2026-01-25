type Props = {
  status: {
    collector: string;
    lastSync: string;
    autoUpdate: boolean;
  };
};

export function SystemStatusPanel({ status }: Props) {
  return (
    <section className="bg-card rounded-xl p-4">
      <h2 className="text-lg font-semibold mb-4">시스템 상태</h2>
      <div className="space-y-3">
        <StatusRow label="Collector" value={status.collector} />
        <StatusRow label="마지막 동기화" value={status.lastSync} />
        <StatusRow
          label="Auto-update"
          value={status.autoUpdate ? "Enabled" : "Disabled"}
        />
      </div>
    </section>
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
