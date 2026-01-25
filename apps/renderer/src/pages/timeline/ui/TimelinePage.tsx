import { TimelineSlice } from "../../../entities/activity/model";
import { TimelineFilters } from "../../../widgets/timeline/Filters";
import { TimelineStrip } from "../../../widgets/timeline/Strip";
import { TimelineSessionsList } from "../../../widgets/timeline/SessionsList";

type Props = {
  slices: TimelineSlice[];
};

export function TimelinePage({ slices }: Props) {
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
      <section className="bg-card rounded-xl p-4 space-y-4">
        <TimelineFilters />
        <TimelineStrip slices={slices} />
      </section>
      <TimelineSessionsList slices={slices} />
    </>
  );
}
