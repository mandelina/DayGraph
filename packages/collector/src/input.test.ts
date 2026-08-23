import { describe, expect, it } from "vitest";
import {
  readInputCounts,
  resetInputCounts,
} from "./input";

describe("input counters", () => {
  it("측정 구간을 초기화하면 다음 tick에 이전 입력이 남지 않는다", () => {
    resetInputCounts();
    expect(readInputCounts()).toEqual({ clicks: 0, keypress: 0 });
  });
});
