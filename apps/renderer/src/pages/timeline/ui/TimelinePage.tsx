import { useMemo, useState } from "react";
import {
  ActivityLoadState,
  TimelineSlice,
  TimelineBucket,
} from "../../../entities/activity/model";
import type { CollectorStatusResponse } from "@daygraph/shared/ipc";
import { getCollectorStatusIssue } from "../../../app/providers/useCollectorStatus";
import { bucketizeTimeline } from "../../../app/providers/useActivityData";
import {
  filterTimelineSlices,
  getTimelineFilterCounts,
} from "../../../entities/activity/lib/filterTimeline";
import type { TimelineFilterMode } from "../../../entities/activity/model";
import { TimelineFilters } from "../../../widgets/timeline/Filters";
import { TimelineStrip } from "../../../widgets/timeline/Strip";
import { TimelineSessionsList } from "../../../widgets/timeline/SessionsList";

type Props = {
  slices: TimelineSlice[];
  buckets: TimelineBucket[];
  loadState: ActivityLoadState;
  isUsingMockData: boolean;
  errorMessage: string | null;
  collectorStatus: CollectorStatusResponse | null;
};

export function TimelinePage({
  slices,
  buckets,
  loadState,
  isUsingMockData,
  errorMessage,
  collectorStatus,
}: Props) {
  const [activeFilter, setActiveFilter] =
    useState<TimelineFilterMode>("all");
  const filterCounts = useMemo(() => getTimelineFilterCounts(slices), [slices]);
  const filteredSlices = useMemo(
    () => filterTimelineSlices(slices, activeFilter),
    [activeFilter, slices],
  );
  const filteredBuckets = useMemo(
    () => (activeFilter === "all" ? buckets : bucketizeTimeline(filteredSlices)),
    [activeFilter, buckets, filteredSlices],
  );

  return (
    <>
      <header className="bg-accent text-foreground px-4 py-3 rounded-xl flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide font-semibold text-foreground/80">
            Timeline
          </div>
          <div className="text-2xl font-bold">집중도 시간대 분석</div>
        </div>
        <div className="text-sm text-foreground/70">
          정밀 Activity Timeline
        </div>
      </header>
      <TimelineStateNotice
        loadState={loadState}
        isUsingMockData={isUsingMockData}
        errorMessage={errorMessage}
        collectorStatus={collectorStatus}
      />
      <section className="bg-card rounded-xl p-4 space-y-4">
        <TimelineFilters
          activeFilter={activeFilter}
          counts={filterCounts}
          onChange={setActiveFilter}
        />
        <TimelineStrip buckets={filteredBuckets} />
      </section>
      <TimelineSessionsList slices={filteredSlices} />
    </>
  );
}

function TimelineStateNotice({
  loadState,
  isUsingMockData,
  errorMessage,
  collectorStatus,
}: {
  loadState: ActivityLoadState;
  isUsingMockData: boolean;
  errorMessage: string | null;
  collectorStatus: CollectorStatusResponse | null;
}) {
  if (isUsingMockData) {
    return (
      <section className="bg-card rounded-xl border border-warning/40 p-3 text-sm text-warning">
        목업 타임라인을 표시 중입니다.
      </section>
    );
  }
  if (loadState === "error") {
    return (
      <section className="bg-card rounded-xl border border-danger/40 p-3 text-sm text-danger">
        Collector 데이터를 가져오지 못했습니다.
        {errorMessage ? ` ${errorMessage}` : ""}
      </section>
    );
  }
  const issue = getCollectorStatusIssue(collectorStatus);
  if (issue) {
    return (
      <section className="bg-card rounded-xl border border-warning/40 p-3 text-sm text-warning">
        Collector가 일부 기능을 사용할 수 없습니다. {issue}
      </section>
    );
  }
  return null;
}
