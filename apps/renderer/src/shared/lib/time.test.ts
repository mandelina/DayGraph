import { describe, expect, it } from "vitest";
import { formatLocalDateISO } from "./time";

describe("formatLocalDateISO", () => {
  it("로컬 Date 구성 요소로 YYYY-MM-DD를 만든다", () => {
    const date = new Date(2026, 7, 11, 23, 30, 0, 0);

    expect(formatLocalDateISO(date)).toBe("2026-08-11");
  });
});
