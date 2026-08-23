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
import { PageHeader } from "../../../shared/ui/PageHeader";
import { formatCalendarDate } from "../../../shared/lib/calendar";

type Props = {
  slices: TimelineSlice[];
  buckets: TimelineBucket[];
  selectedDate: string;
  loadState: ActivityLoadState;
  isUsingMockData: boolean;
  errorMessage: string | null;
  collectorStatus: CollectorStatusResponse | null;
};

export function TimelinePage({
  slices,
  buckets,
  selectedDate,
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
    <div className="space-y-5">
      <PageHeader
        eyebrow="Timeline / Activity rhythm"
        title="집중도 시간대 분석"
        description={`${formatCalendarDate(selectedDate)}의 활동 흐름과 앱 전환을 확인합니다.`}
        meta={<>{formatCalendarDate(selectedDate)}<br />Timeline</>}
        tone="sage"
      />
      <TimelineStateNotice
        loadState={loadState}
        isUsingMockData={isUsingMockData}
        errorMessage={errorMessage}
        collectorStatus={collectorStatus}
      />
      <section className="surface-card space-y-5 p-5 sm:p-6">
        <TimelineFilters
          activeFilter={activeFilter}
          counts={filterCounts}
          onChange={setActiveFilter}
        />
        <TimelineStrip buckets={filteredBuckets} />
      </section>
      <TimelineSessionsList slices={filteredSlices} />
    </div>
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
      <section className="status-banner status-banner-warning">
        <span className="status-banner-dot" aria-hidden />
        <span>목업 타임라인을 표시 중입니다.</span>
      </section>
    );
  }
  if (loadState === "error") {
    return (
      <section className="status-banner status-banner-danger">
        <span className="status-banner-dot" aria-hidden />
        <span>
          Collector 데이터를 가져오지 못했습니다.
          {errorMessage ? ` ${errorMessage}` : ""}
        </span>
      </section>
    );
  }
  const issue = getCollectorStatusIssue(collectorStatus);
  if (issue) {
    return (
      <section className="status-banner status-banner-warning">
        <span className="status-banner-dot" aria-hidden />
        <span>Collector가 일부 기능을 사용할 수 없습니다. {issue}</span>
      </section>
    );
  }
  return null;
}
