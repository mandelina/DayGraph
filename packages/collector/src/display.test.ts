import { describe, expect, it } from "vitest";
import {
  normalizeMonitors,
  parseMacOSMonitorOutput,
  selectDisplayId,
} from "./display";

describe("display monitor mapping", () => {
  it("Windows Monitor 객체의 getBounds를 사용한다", () => {
    const monitors = normalizeMonitors([
      {
        id: 42,
        getBounds: () => ({ x: 0, y: 0, width: 1920, height: 1080 }),
      },
    ]);

    expect(monitors).toEqual([
      { id: 42, bounds: { x: 0, y: 0, width: 1920, height: 1080 } },
    ]);
  });

  it("macOS CoreGraphics 출력과 음수 좌표 모니터를 파싱한다", () => {
    const monitors = parseMacOSMonitorOutput(
      "3,0,0,2560,1440\n1,-1512,0,1512,982\n",
    );

    expect(selectDisplayId(monitors, {
      x: -1400,
      y: 100,
      width: 800,
      height: 600,
    })).toBe(1);
    expect(selectDisplayId(monitors, {
      x: 100,
      y: 100,
      width: 800,
      height: 600,
    })).toBe(3);
  });

  it("잘못된 monitor bounds와 id를 버린다", () => {
    expect(
      normalizeMonitors([
        { id: "bad", bounds: { x: 0, y: 0, width: 100, height: 100 } },
        { id: 1, bounds: { x: 0, y: 0, width: 0, height: 100 } },
      ]),
    ).toEqual([]);
  });
});
