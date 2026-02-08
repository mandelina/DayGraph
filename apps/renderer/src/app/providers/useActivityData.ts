import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AppActivity,
  TimelineSlice,
  TimelineBucket,
  TimelineBucketApp,
} from "../../entities/activity/model";
import { summarizeByApp } from "../../entities/activity/lib/calculateScore";

const POLL_INTERVAL_MS = 5000;
const BUCKET_MINUTES = 5;
const BUCKET_MS = BUCKET_MINUTES * 60 * 1000;

type ActivityData = {
  activities: Activity[];
  todayStats: AppActivity[];
  timelineSlices: TimelineSlice[];
  timelineBuckets: TimelineBucket[];
};

/**
 * Collector → Electron IPC → Renderer 흐름으로 들어온 Activity 데이터를
 * Today 요약과 Timeline 그래프로 동시에 사용할 수 있게 가공한다.
 */
export function useActivityData(): ActivityData {
  const [rows, setRows] = useState<Activity[]>([]);

  useEffect(() => {
    const todayISO = new Date().toISOString().slice(0, 10);
    let disposed = false;

    const fetchDay = () => {
      window.api
        ?.queryDay(todayISO)
        ?.then((res: unknown) => {
          if (!Array.isArray(res)) {
            console.warn("[ActivityData] queryDay malformed response", res);
            if (!disposed) setRows([]);
            return;
          }
          if (!disposed) setRows(res as Activity[]);
        })
        .catch((err) => {
          console.error("[ActivityData] queryDay failed", err);
          if (!disposed) setRows([]);
        });
    };

    fetchDay();
    const interval = setInterval(fetchDay, POLL_INTERVAL_MS);

    return () => {
      disposed = true;
      clearInterval(interval);
    };
  }, []);

  const fallbackActivities = useMemo(() => generateMockActivities(), []);

  const todayStats = useMemo(() => {
    const source = rows.length > 0 ? rows : fallbackActivities;
    return summarizeByApp(source);
  }, [rows, fallbackActivities]);

  const timelineSlices = useMemo(() => {
    const source = rows.length > 0 ? rows : fallbackActivities;
    return buildTimelineSlices(source);
  }, [rows, fallbackActivities]);

  const timelineBuckets = useMemo(
    () => bucketizeTimeline(timelineSlices),
    [timelineSlices],
  );

  return { activities: rows, todayStats, timelineSlices, timelineBuckets };
}

/**
 * 1초 간격 Activity 로그를 가로 시간대 구간으로 묶어 TimelineSlice 배열로 변환한다.
 * 앱/윈도우가 동일하고 1.5초 이내로 연속된 데이터는 하나의 블록으로 합쳐 밀도 그래프를 부드럽게 만든다.
 */
function buildTimelineSlices(data: Activity[]): TimelineSlice[] {
  if (data.length === 0) return [];
  const sorted = [...data].sort((a, b) =>
    a.timestamp.localeCompare(b.timestamp),
  );
  const slices: TimelineSlice[] = [];
  sorted.forEach((entry) => {
    if (slices.length === 0) {
      slices.push(createSlice(entry));
      return;
    }
    const last = slices[slices.length - 1];
    const lastEnd = new Date(last.end).getTime();
    const currentStart = new Date(entry.timestamp).getTime();
    const contiguous = currentStart - lastEnd <= 1500; // DB는 1초 주기라 1.5초 이내면 같은 구간으로 간주
    const sameApp = last.appName === entry.app_name;

    if (contiguous && sameApp) {
      last.end = addSecond(entry.timestamp);
      last.clicks += entry.clicks;
      last.keypress += entry.keypress;
      last.isActive = last.isActive || Boolean(entry.is_active);
      last.windowTitle = entry.window_title; // 가장 최근 창 제목으로 업데이트해 세션 요약을 최신 상태로 유지
      if (!last.appPath && entry.app_path) {
        console.log("[TimelineSlice] patched appPath", {
          app: entry.app_name,
          appPath: entry.app_path,
        });
        last.appPath = entry.app_path;
      }
      if (!last.bundleId && entry.bundle_id) {
        console.log("[TimelineSlice] patched bundleId", {
          app: entry.app_name,
          bundleId: entry.bundle_id,
        });
        last.bundleId = entry.bundle_id;
      }
    } else {
      slices.push(createSlice(entry));
    }
  });
  return slices;
}

function createSlice(entry: Activity): TimelineSlice {
  return {
    start: entry.timestamp,
    end: addSecond(entry.timestamp),
    appName: entry.app_name,
    appPath: entry.app_path ?? null,
    bundleId: entry.bundle_id ?? null,
    windowTitle: entry.window_title,
    isActive: Boolean(entry.is_active),
    clicks: entry.clicks,
    keypress: entry.keypress,
  };
}

function addSecond(timestamp: string) {
  const time = new Date(timestamp).getTime();
  return new Date(time + 1000).toISOString();
}

/**
 * Collector가 비활성화된 환경에서도 UI를 확인할 수 있도록 1분 분량 목업 데이터를 생성한다.
 */
function generateMockActivities(): Activity[] {
  const now = Date.now();
  return Array.from({ length: 60 }, (_, idx) => {
    const timestamp = new Date(now - (59 - idx) * 1000).toISOString();
    return {
      timestamp,
      app_name: idx % 2 === 0 ? "VSCode" : "Chrome",
      app_path: null,
      bundle_id: idx % 2 === 0 ? "com.microsoft.VSCode" : "com.google.Chrome",
      window_title: idx % 2 === 0 ? "main.ts — DayGraph" : "Docs — DayGraph",
      display_id: idx % 3 === 0 ? 0 : 1,
      is_active: true,
      clicks: (idx % 5) + 1,
      keypress: (idx % 7) + 2,
    };
  });
}

function bucketizeTimeline(slices: TimelineSlice[]): TimelineBucket[] {
  if (slices.length === 0) return [];
  const map = new Map<number, BucketAccumulator>();
  for (const slice of slices) {
    distributeSliceAcrossBuckets(slice, map);
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([bucketStart, bucket]) => {
      const apps = Array.from(bucket.apps.values()).sort(
        (a, b) => b.duration - a.duration,
      );
      const representative = apps[0] ?? null;
      const share =
        representative && bucket.totalDuration > 0
          ? representative.duration / bucket.totalDuration
          : 0;
      return {
        bucketStart: new Date(bucketStart).toISOString(),
        bucketLabel: formatBucketLabel(bucketStart),
        totalDuration: bucket.totalDuration,
        representative,
        share,
        isMixed: Boolean(representative) && share < 0.3,
        others: apps.slice(1),
      };
    });
}

type BucketAccumulator = {
  totalDuration: number;
  apps: Map<string, TimelineBucketApp>;
};

function distributeSliceAcrossBuckets(
  slice: TimelineSlice,
  map: Map<number, BucketAccumulator>,
) {
  const sliceStart = new Date(slice.start).getTime();
  const sliceEnd = new Date(slice.end).getTime();
  const sliceDurationSec = Math.max((sliceEnd - sliceStart) / 1000, 1);

  let cursor = sliceStart;
  while (cursor < sliceEnd) {
    const bucketStart = cursor - (cursor % BUCKET_MS);
    const bucketEnd = bucketStart + BUCKET_MS;
    const segmentEnd = Math.min(sliceEnd, bucketEnd);
    const segmentDurationSec = Math.max((segmentEnd - cursor) / 1000, 0);
    const ratio = segmentDurationSec / sliceDurationSec;
    const segmentClicks = slice.clicks * ratio;
    const segmentKeys = slice.keypress * ratio;

    const bucket =
      map.get(bucketStart) ?? {
        totalDuration: 0,
        apps: new Map<string, TimelineBucketApp>(),
      };
    bucket.totalDuration += segmentDurationSec;

    const appEntry =
      bucket.apps.get(slice.appName) ??
      {
        appName: slice.appName,
        appPath: slice.appPath,
        bundleId: slice.bundleId,
        duration: 0,
        clicks: 0,
        keypress: 0,
        isActive: false,
      };
    appEntry.duration += segmentDurationSec;
    appEntry.clicks += segmentClicks;
    appEntry.keypress += segmentKeys;
    appEntry.isActive = appEntry.isActive || slice.isActive;
    if (!appEntry.appPath && slice.appPath) {
      appEntry.appPath = slice.appPath;
    }
    if (!appEntry.bundleId && slice.bundleId) {
      appEntry.bundleId = slice.bundleId;
    }

    bucket.apps.set(slice.appName, appEntry);
    map.set(bucketStart, bucket);

    cursor = segmentEnd;
  }
}

function formatBucketLabel(bucketStartMs: number) {
  const date = new Date(bucketStartMs);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}
