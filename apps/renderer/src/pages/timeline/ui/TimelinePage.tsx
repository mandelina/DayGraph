import {
  ActivityLoadState,
  TimelineSlice,
  TimelineBucket,
} from "../../../entities/activity/model";
import { TimelineFilters } from "../../../widgets/timeline/Filters";
import { TimelineStrip } from "../../../widgets/timeline/Strip";
import { TimelineSessionsList } from "../../../widgets/timeline/SessionsList";

type Props = {
  slices: TimelineSlice[];
  buckets: TimelineBucket[];
  loadState: ActivityLoadState;
  isUsingMockData: boolean;
  errorMessage: string | null;
};

export function TimelinePage({
  slices,
  buckets,
  loadState,
  isUsingMockData,
  errorMessage,
}: Props) {
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
      />
      <section className="bg-card rounded-xl p-4 space-y-4">
        <TimelineFilters />
        <TimelineStrip buckets={buckets} />
      </section>
      <TimelineSessionsList slices={slices} />
    </>
  );
}

function TimelineStateNotice({
  loadState,
  isUsingMockData,
  errorMessage,
}: {
  loadState: ActivityLoadState;
  isUsingMockData: boolean;
  errorMessage: string | null;
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
  return null;
}
