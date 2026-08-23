import { describe, expect, it } from "vitest";
import type { CollectorStatusResponse } from "@daygraph/shared/ipc";
import {
  createUnavailableStatus,
  getCollectorStatusIssue,
} from "./useCollectorStatus";

describe("collector status notice", () => {
  it("정상 상태는 화면 경고로 표시하지 않는다", () => {
    expect(getCollectorStatusIssue(createStatus())).toBeNull();
  });

  it("backend 오류를 사용자에게 전달한다", () => {
    expect(
      getCollectorStatusIssue(
        createStatus({
          status: "degraded",
          inputBackendError: "input permission denied",
        }),
      ),
    ).toBe("input permission denied");
  });

  it("Electron API가 없으면 연결 불가 상태를 만든다", () => {
    const unavailable = createUnavailableStatus("API missing");
    expect(unavailable.reachable).toBe(false);
    expect(getCollectorStatusIssue(unavailable)).toBe("API missing");
  });
});

function createStatus(
  overrides: Partial<CollectorStatusResponse> = {},
): CollectorStatusResponse {
  return {
    ...createUnavailableStatus("unused"),
    ok: true,
    status: "healthy",
    reachable: true,
    dataQuality: "real",
    error: null,
    ...overrides,
  };
}
