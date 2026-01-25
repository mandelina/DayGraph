import { Activity, AppActivity } from "../model";

const ACTIVE_WEIGHT = 1;
const CLICK_WEIGHT = 2;
const KEYPRESS_WEIGHT = 0.5;

export function summarizeByApp(data: Activity[]): AppActivity[] {
  const map = new Map<string, AppActivity>();

  data.forEach((item) => {
    if (!map.has(item.app_name)) {
      map.set(item.app_name, {
        appName: item.app_name,
        activeSeconds: 0,
        clickCount: 0,
        keypressCount: 0,
        score: 0,
      });
    }
    const target = map.get(item.app_name)!;
    target.activeSeconds += 1;
    target.clickCount += item.clicks;
    target.keypressCount += item.keypress;
  });

  return Array.from(map.values())
    .map((entry) => {
      const weighted =
        entry.activeSeconds * ACTIVE_WEIGHT +
        entry.clickCount * CLICK_WEIGHT +
        entry.keypressCount * KEYPRESS_WEIGHT;
      return { ...entry, score: Number(weighted.toFixed(1)) };
    })
    .sort((a, b) => b.score - a.score);
}
