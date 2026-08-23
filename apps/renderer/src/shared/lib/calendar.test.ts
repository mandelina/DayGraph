import { describe, expect, it } from "vitest";
import {
  formatCalendarDate,
  getCalendarDays,
  getMonthISO,
  shiftMonth,
} from "./calendar";

describe("calendar helpers", () => {
  it("월 이동과 월 시작 ISO를 로컬 날짜 기준으로 계산한다", () => {
    expect(getMonthISO("2026-08-24")).toBe("2026-08-01");
    expect(shiftMonth("2026-08-01", -1)).toBe("2026-07-01");
    expect(shiftMonth("2026-12-01", 1)).toBe("2027-01-01");
  });

  it("6주 달력에 선택 가능한 날짜와 오늘 표시를 만든다", () => {
    const days = getCalendarDays("2026-08-01", "2026-08-24");

    expect(days).toHaveLength(42);
    expect(days.find((day) => day.iso === "2026-08-24")).toMatchObject({
      day: 24,
      isCurrentMonth: true,
      isToday: true,
    });
    expect(days.some((day) => !day.isCurrentMonth)).toBe(true);
  });

  it("선택 날짜를 읽기 쉬운 라벨로 포맷한다", () => {
    expect(formatCalendarDate("2026-08-24")).toContain("8월 24일");
  });
});
