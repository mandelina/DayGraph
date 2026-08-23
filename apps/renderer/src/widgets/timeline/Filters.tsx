import type { TimelineFilterMode } from "../../entities/activity/model";

const FILTERS: Array<{ label: string; mode: TimelineFilterMode }> = [
  { label: "전체 앱", mode: "all" },
  { label: "집중 구간", mode: "focused" },
  { label: "Idle 숨기기", mode: "hide-idle" },
];

type Props = {
  activeFilter: TimelineFilterMode;
  counts: Record<TimelineFilterMode, number>;
  onChange: (filter: TimelineFilterMode) => void;
};

export function TimelineFilters({ activeFilter, counts, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="eyebrow text-muted">View mode</div>
        <div className="mt-1 text-sm font-bold text-foreground">어떤 흐름을 볼까요?</div>
      </div>
      <div className="flex flex-wrap gap-2">
      {FILTERS.map((filter) => {
        const active = filter.mode === activeFilter;
        return (
          <button
            key={filter.mode}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(filter.mode)}
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold transition ${
            active
              ? "bg-foreground text-surface shadow-sm"
              : "border border-border bg-cardMuted/70 text-muted hover:text-foreground"
            }`}
          >
            <span>{filter.label}</span>
            <span className="rounded-full bg-surface/40 px-1.5 py-0.5 text-[10px]">
              {counts[filter.mode]}
            </span>
          </button>
        );
      })}
      </div>
    </div>
  );
}
