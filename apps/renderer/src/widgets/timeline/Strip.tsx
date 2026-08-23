import { TimelineBucket } from "../../entities/activity/model";
import { formatSeconds } from "../../shared/lib/time";
import { AppIcon } from "../../shared/ui/AppIcon";

type Props = {
  buckets: TimelineBucket[];
};

export function TimelineStrip({ buckets }: Props) {
  if (buckets.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted">
        최근 데이터가 없어 타임라인을 렌더링할 수 없습니다.
      </div>
    );
  }

  const gridTemplate = {
    gridTemplateColumns: `repeat(${buckets.length}, minmax(0, 1fr))`,
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4 text-xs text-muted">
        <span>5분 버킷 기준 Activity Timeline</span>
        <span className="hidden sm:inline">hover로 상세 확인</span>
      </div>
      <div
        className="grid gap-1 rounded-2xl border border-border/70 bg-surfaceMuted/60 p-2"
        style={gridTemplate}
      >
        {buckets.map((bucket) => {
          const tooltip = buildTooltip(bucket);
          const opacity = bucket.representative
            ? Math.min(bucket.share + 0.2, 0.95)
            : 0.25;
          const background = bucket.isMixed
            ? "linear-gradient(180deg, rgba(120,113,108,0.28) 0%, rgba(120,113,108,0.5) 100%)"
            : `linear-gradient(180deg, color-mix(in srgb, var(--color-accent) ${Math.round(
                opacity * 100,
              )}%, transparent) 0%, color-mix(in srgb, var(--color-primary) ${Math.round(
                Math.max(opacity - 0.18, 0.08) * 100,
              )}%, transparent) 100%)`;
          const iconSize = bucket.isMixed ? 20 : 28;
          return (
            <div
              key={bucket.bucketStart}
              className="relative h-20 overflow-hidden rounded-xl border border-border/60 bg-muted transition-transform hover:-translate-y-0.5"
              style={{ background }}
              title={tooltip}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                {bucket.representative && !bucket.isMixed ? (
                  <AppIcon
                    appName={bucket.representative.appName}
                    appPath={bucket.representative.appPath}
                    bundleId={bucket.representative.bundleId}
                    size={iconSize}
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full border border-border/70 bg-background/70 grid place-items-center text-[10px] text-foreground/70">
                    Mix
                  </div>
                )}
                <div className="text-[9px] font-semibold text-foreground/60">
                  {bucket.bucketLabel}
                </div>
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

function buildTooltip(bucket: TimelineBucket) {
  const lines = [
    `[${bucket.bucketLabel}] 총 체류 ${formatSeconds(
      Math.round(bucket.totalDuration),
    )}`,
  ];
  if (bucket.representative) {
    lines.push(
      `대표 · ${bucket.representative.appName} (${Math.round(
        bucket.share * 100,
      )}%)`,
      `체류 ${formatSeconds(
        Math.round(bucket.representative.duration),
      )} / 클릭 ${bucket.representative.clicks.toFixed(
        1,
      )} / 키 ${bucket.representative.keypress.toFixed(1)}`,
    );
  } else {
    lines.push("대표 앱 없음");
  }
  if (bucket.others.length > 0) {
    const othersPreview = bucket.others
      .slice(0, 3)
      .map(
        (app) =>
          `${app.appName}: ${formatSeconds(Math.round(app.duration))}`,
      )
      .join(", ");
    lines.push(
      `기타 ${bucket.others.length}개 앱`,
      othersPreview,
    );
  }
  return lines.join("\n");
}
