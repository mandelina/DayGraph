import { useEffect, useState } from "react";
import type { QueryRangeSummaryResponse } from "@daygraph/shared/ipc";
import type { ActivityLoadState } from "../../entities/activity/model";

const RANGE_POLL_INTERVAL_MS = 30_000;

type ActivityRangeState = {
  summary: QueryRangeSummaryResponse;
  loadState: Exclude<ActivityLoadState, "mock">;
  errorMessage: string | null;
};

export function useActivityRange(startDateISO: string, endDateISO: string) {
  const [state, setState] = useState<ActivityRangeState>({
    summary: { apps: [], days: [] },
    loadState: "loading",
    errorMessage: null,
  });

  useEffect(() => {
    let disposed = false;
    const api = window.api;
    if (!api?.queryRangeSummary) {
      setState({
        summary: { apps: [], days: [] },
        loadState: "error",
        errorMessage: "Electron API unavailable; activity data cannot be loaded.",
      });
      return;
    }

    const fetchRange = () => {
      api
        .queryRangeSummary(startDateISO, endDateISO)
        .then((response) => {
          if (disposed) return;
          if (
            !response ||
            !Array.isArray(response.apps) ||
            !Array.isArray(response.days)
          ) {
            setState({
              summary: { apps: [], days: [] },
              loadState: "error",
              errorMessage: "Collector returned malformed activity data.",
            });
            return;
          }
          setState({
            summary: response,
            loadState: response.days.length > 0 ? "ready" : "empty",
            errorMessage: null,
          });
        })
        .catch((error: unknown) => {
          if (disposed) return;
          setState({
            summary: { apps: [], days: [] },
            loadState: "error",
            errorMessage: formatError(error),
          });
        });
    };

    fetchRange();
    const interval = setInterval(fetchRange, RANGE_POLL_INTERVAL_MS);
    return () => {
      disposed = true;
      clearInterval(interval);
    };
  }, [startDateISO, endDateISO]);

  return state;
}

function formatError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
