import { TimelineSlice } from "../../entities/activity/model";
import { formatHour } from "../../shared/lib/time";

type Props = {
  slices: TimelineSlice[];
};

export function TimelineStrip({ slices }: Props) {
  const maxIntensity = Math.max(
    ...slices.map((s) => s.clicks + s.keypress + (s.isActive ? 5 : 0)),
    1,
  );
  return (
    <div className="space-y-2">
      <div className="text-xs text-muted">시간대별 Activity Intensity</div>
      <div className="flex h-24 rounded-xl overflow-hidden border border-border">
        {slices.map((slice) => {
          const intensity =
            slice.clicks + slice.keypress + (slice.isActive ? 5 : 0);
          const ratio = (intensity / maxIntensity) * 100;
          return (
            <div
              key={slice.start}
              className="flex-1 relative"
              style={{
                background: `linear-gradient(180deg, rgba(99,102,241,${
                  ratio / 120
                }) 0%, rgba(59,130,246,${ratio / 140}) 100%)`,
              }}
              title={`${formatHour(slice.start)} – ${formatHour(
                slice.end,
              )} • ${slice.appName}\n${slice.windowTitle}\n클릭 ${slice.clicks}, 키 ${slice.keypress}`}
            >
              <div className="absolute inset-x-1 bottom-1 text-[10px] text-foreground/70 truncate">
                {slice.appName}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-muted uppercase tracking-wide">
        <span>AM</span>
        <span>NOON</span>
        <span>PM</span>
      </div>
    </div>
  );
}
