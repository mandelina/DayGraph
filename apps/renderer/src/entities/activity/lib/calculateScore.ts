import { Activity, AppActivity } from "../model";

export const ACTIVITY_SCORE_WEIGHTS = {
  active: 1,
  clicks: 2,
  keys: 0.5,
} as const;

export function summarizeByApp(data: Activity[]): AppActivity[] {
  const map = new Map<string, AppActivity>();

  data.forEach((item) => {
    if (!item.is_active) return;
    if (!map.has(item.app_name)) {
      map.set(item.app_name, {
        appName: item.app_name,
        appPath: item.app_path ?? null,
        bundleId: item.bundle_id ?? null,
        activeSeconds: 0,
        clickCount: 0,
        keypressCount: 0,
        score: 0,
      });
    }
    const target = map.get(item.app_name)!;
    if (!target.appPath && item.app_path) target.appPath = item.app_path;
    if (!target.bundleId && item.bundle_id) target.bundleId = item.bundle_id;
    target.activeSeconds += 1;
    target.clickCount += item.clicks;
    target.keypressCount += item.keypress;
  });

  return Array.from(map.values())
    .map((entry) => {
      const weighted =
        entry.activeSeconds * ACTIVITY_SCORE_WEIGHTS.active +
        entry.clickCount * ACTIVITY_SCORE_WEIGHTS.clicks +
        entry.keypressCount * ACTIVITY_SCORE_WEIGHTS.keys;
      return { ...entry, score: Number(weighted.toFixed(1)) };
    })
    .sort((a, b) => b.score - a.score);
}
