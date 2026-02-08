import { TimelineBucket } from "../../entities/activity/model";
import { formatSeconds } from "../../shared/lib/time";
import { AppIcon } from "../../shared/ui/AppIcon";

type Props = {
  buckets: TimelineBucket[];
};

export function TimelineStrip({ buckets }: Props) {
  if (buckets.length === 0) {
    return (
      <div className="h-32 rounded-xl border border-dashed border-border flex items-center justify-center text-sm text-muted">
        최근 데이터가 없어 타임라인을 렌더링할 수 없습니다.
      </div>
    );
  }

  const gridTemplate = {
    gridTemplateColumns: `repeat(${buckets.length}, minmax(0, 1fr))`,
  };

  return (
    <div className="space-y-2">
      <div className="text-xs text-muted">
        5분 버킷 기준 Activity Timeline (대표 앱 기준, hover로 상세 확인)
      </div>
      <div
        className="grid gap-[1px] rounded-xl border border-border p-[3px] bg-card"
        style={gridTemplate}
      >
        {buckets.map((bucket) => {
          const tooltip = buildTooltip(bucket);
          const opacity = bucket.representative
            ? Math.min(bucket.share + 0.2, 0.95)
            : 0.25;
          const background = bucket.isMixed
            ? "linear-gradient(180deg, rgba(148,163,184,0.35) 0%, rgba(100,116,139,0.45) 100%)"
            : `linear-gradient(180deg, rgba(99,102,241,${opacity}) 0%, rgba(59,130,246,${
                opacity - 0.2
              }) 100%)`;
          const iconSize = bucket.isMixed ? 20 : 28;
          return (
            <div
              key={bucket.bucketStart}
              className="relative h-20 rounded-md overflow-hidden border border-border/60 bg-muted transition-transform hover:-translate-y-0.5"
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
