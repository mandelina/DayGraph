export type UiohookEventName = "mousedown" | "keydown";

export type UiohookEventSource = {
  on(event: UiohookEventName, listener: () => void): unknown;
  start(): void;
  stop?: () => void;
  off?: (event: UiohookEventName, listener: () => void) => unknown;
  removeListener?: (
    event: UiohookEventName,
    listener: () => void,
  ) => unknown;
};

export type InputBackendHandle = {
  name: string;
  start: () => void;
  stop: () => void;
};

export function createUiohookInputBackend(
  source: UiohookEventSource,
  platform: string,
  onClick: () => void,
  onKeypress: () => void,
): InputBackendHandle {
  const onMouseDown = () => onClick();
  const onKeyDown = () => onKeypress();
  let listenersAttached = false;

  const detachListeners = () => {
    const removeListener = source.off ?? source.removeListener;
    removeListener?.call(source, "mousedown", onMouseDown);
    removeListener?.call(source, "keydown", onKeyDown);
    listenersAttached = false;
  };

  return {
    name: `uiohook-${platform}`,
    start: () => {
      if (listenersAttached) return;
      source.on("mousedown", onMouseDown);
      source.on("keydown", onKeyDown);
      listenersAttached = true;
      try {
        source.start();
      } catch (error) {
        detachListeners();
        throw error;
      }
    },
    stop: () => {
      detachListeners();
      source.stop?.();
    },
  };
}
