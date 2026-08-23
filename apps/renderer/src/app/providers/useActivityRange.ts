import { useEffect, useState } from "react";
import type { Activity, ActivityLoadState } from "../../entities/activity/model";

type ActivityRangeState = {
  rows: Activity[];
  loadState: Exclude<ActivityLoadState, "mock">;
  errorMessage: string | null;
};

export function useActivityRange(startDateISO: string, endDateISO: string) {
  const [state, setState] = useState<ActivityRangeState>({
    rows: [],
    loadState: "loading",
    errorMessage: null,
  });

  useEffect(() => {
    let disposed = false;
    const api = window.api;
    if (!api?.queryRange) {
      setState({
        rows: [],
        loadState: "error",
        errorMessage: "Electron API unavailable; activity data cannot be loaded.",
      });
      return;
    }

    const fetchRange = () => {
      api
        .queryRange(startDateISO, endDateISO)
        .then((response) => {
          if (disposed) return;
          if (!Array.isArray(response)) {
            setState({
              rows: [],
              loadState: "error",
              errorMessage: "Collector returned malformed activity data.",
            });
            return;
          }
          setState({
            rows: response as Activity[],
            loadState: response.length > 0 ? "ready" : "empty",
            errorMessage: null,
          });
        })
        .catch((error: unknown) => {
          if (disposed) return;
          setState({
            rows: [],
            loadState: "error",
            errorMessage: formatError(error),
          });
        });
    };

    fetchRange();
    const interval = setInterval(fetchRange, 5000);
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
