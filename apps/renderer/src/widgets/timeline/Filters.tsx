const FILTERS = [
  { label: "전체 앱", active: true },
  { label: "집중 구간", active: false },
  { label: "Idle 숨기기", active: false },
];

export function TimelineFilters() {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((chip) => (
        <span
          key={chip.label}
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            chip.active
              ? "bg-accent text-foreground"
              : "bg-cardMuted text-muted"
          }`}
        >
          {chip.label}
        </span>
      ))}
    </div>
  );
}
