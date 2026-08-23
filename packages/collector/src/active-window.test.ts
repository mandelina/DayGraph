import { describe, expect, it, vi } from "vitest";
import { getActiveWindow, getActiveWindowStatus } from "./active-window";

const mocks = vi.hoisted(() => ({
  importOptionalModule: vi.fn(),
}));

vi.mock("./optional-import", () => mocks);

describe("active window backend", () => {
  it("backend 권한/로드 실패 시 가짜 window를 만들지 않는다", async () => {
    mocks.importOptionalModule.mockRejectedValueOnce(
      new Error("accessibility permission denied"),
    );

    await expect(getActiveWindow()).resolves.toBeNull();
    expect(getActiveWindowStatus()).toEqual({
      activeWindowBackend: "unavailable",
      activeWindowBackendError: "accessibility permission denied",
    });
  });

  it("get-windows 응답을 activity용 형태로 변환한다", async () => {
    mocks.importOptionalModule.mockResolvedValueOnce({
      activeWindow: vi.fn().mockResolvedValue({
        title: "DayGraph",
        bounds: { x: 10, y: 20, width: 800, height: 600 },
        owner: {
          name: "Electron",
          path: "/Applications/Electron.app",
          bundleId: "com.example.electron",
        },
      }),
    });

    await expect(getActiveWindow()).resolves.toEqual({
      app: "Electron",
      path: "/Applications/Electron.app",
      bundleId: "com.example.electron",
      title: "DayGraph",
      bounds: { x: 10, y: 20, width: 800, height: 600 },
    });
    expect(getActiveWindowStatus()).toEqual({
      activeWindowBackend: "get-windows",
      activeWindowBackendError: null,
    });
  });
});
