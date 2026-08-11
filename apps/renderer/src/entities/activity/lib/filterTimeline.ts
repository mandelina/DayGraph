import type {
  TimelineFilterMode,
  TimelineSlice,
} from "../model";

export function filterTimelineSlices(
  slices: TimelineSlice[],
  mode: TimelineFilterMode,
) {
  if (mode === "focused") {
    return slices.filter((slice) => slice.clicks + slice.keypress >= 5);
  }
  if (mode === "hide-idle") {
    return slices.filter(
      (slice) => slice.isActive && slice.clicks + slice.keypress > 0,
    );
  }
  return slices;
}

export function getTimelineFilterCounts(slices: TimelineSlice[]) {
  return {
    all: slices.length,
    focused: filterTimelineSlices(slices, "focused").length,
    "hide-idle": filterTimelineSlices(slices, "hide-idle").length,
  } satisfies Record<TimelineFilterMode, number>;
}
