import { describe, expect, it } from "vitest";
import { getLocalDayRange } from "./queries";

describe("getLocalDayRange", () => {
  it("로컬 날짜의 시작과 다음날 시작을 UTC ISO 범위로 변환한다", () => {
    const range = getLocalDayRange("2026-08-11");

    expect(range).toEqual({
      start: new Date(2026, 7, 11, 0, 0, 0, 0).toISOString(),
      end: new Date(2026, 7, 12, 0, 0, 0, 0).toISOString(),
    });
  });

  it("존재하지 않는 날짜는 거부한다", () => {
    expect(() => getLocalDayRange("2026-02-31")).toThrow(
      "invalid dateISO: 2026-02-31",
    );
  });
});
