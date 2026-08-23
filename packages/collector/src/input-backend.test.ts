import { describe, expect, it, vi } from "vitest";
import {
  createUiohookInputBackend,
  type UiohookEventName,
} from "./input-backend";

class FakeUiohook implements UiohookEventSourceLike {
  private readonly listeners = new Map<
    UiohookEventName,
    Set<() => void>
  >();

  readonly start = vi.fn();
  readonly stop = vi.fn();
  off?: (event: UiohookEventName, listener: () => void) => void;
  removeListener?: (
    event: UiohookEventName,
    listener: () => void,
  ) => void;

  constructor() {
    this.off = (event, listener) => this.removeEvent(event, listener);
  }

  on(event: UiohookEventName, listener: () => void) {
    const listeners = this.listeners.get(event) ?? new Set<() => void>();
    listeners.add(listener);
    this.listeners.set(event, listeners);
  }

  emit(event: UiohookEventName) {
    for (const listener of this.listeners.get(event) ?? []) {
      listener();
    }
  }

  removeEvent(event: UiohookEventName, listener: () => void) {
    this.listeners.get(event)?.delete(listener);
  }
}

type UiohookEventSourceLike = Parameters<
  typeof createUiohookInputBackend
>[0];

describe("uiohook input backend", () => {
  it("Windows 이벤트를 클릭/키 입력 카운터에 연결하고 정리한다", () => {
    const source = new FakeUiohook();
    const onClick = vi.fn();
    const onKeypress = vi.fn();

    const backend = createUiohookInputBackend(
      source,
      "win32",
      onClick,
      onKeypress,
    );

    expect(backend.name).toBe("uiohook-win32");
    backend.start();
    backend.start();
    source.emit("mousedown");
    source.emit("keydown");
    source.emit("keydown");

    expect(source.start).toHaveBeenCalledOnce();
    expect(onClick).toHaveBeenCalledOnce();
    expect(onKeypress).toHaveBeenCalledTimes(2);

    backend.stop();
    source.emit("mousedown");
    source.emit("keydown");

    expect(source.stop).toHaveBeenCalledOnce();
    expect(onClick).toHaveBeenCalledOnce();
    expect(onKeypress).toHaveBeenCalledTimes(2);
  });

  it("off가 없어도 removeListener로 이벤트를 정리한다", () => {
    const source = new FakeUiohook();
    const removeListener = vi.fn((
      event: UiohookEventName,
      listener: () => void,
    ) => source.removeEvent(event, listener));
    delete source.off;
    source.removeListener = removeListener;
    const onClick = vi.fn();
    const onKeypress = vi.fn();

    const backend = createUiohookInputBackend(
      source,
      "linux",
      onClick,
      onKeypress,
    );
    backend.start();
    backend.stop();
    source.emit("mousedown");
    source.emit("keydown");

    expect(removeListener).toHaveBeenCalledTimes(2);
    expect(onClick).not.toHaveBeenCalled();
    expect(onKeypress).not.toHaveBeenCalled();
  });

  it("native start 실패 시 listener를 남기지 않는다", () => {
    const source = new FakeUiohook();
    source.start.mockImplementationOnce(() => {
      throw new Error("native start failed");
    });
    const onClick = vi.fn();
    const onKeypress = vi.fn();
    const backend = createUiohookInputBackend(
      source,
      "win32",
      onClick,
      onKeypress,
    );

    expect(() => backend.start()).toThrow("native start failed");
    source.emit("mousedown");
    source.emit("keydown");

    expect(onClick).not.toHaveBeenCalled();
    expect(onKeypress).not.toHaveBeenCalled();
  });
});
