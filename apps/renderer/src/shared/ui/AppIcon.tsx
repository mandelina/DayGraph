import { useEffect, useState } from "react";

type Props = {
  appName: string;
  appPath?: string | null;
  bundleId?: string | null;
  size?: number;
};

// Renderer에서 중복 IPC 호출을 막기 위해 메모리 캐시 사용
const iconCache = new Map<string, string | null>();

export function AppIcon({ appName, appPath, bundleId, size = 32 }: Props) {
  const cacheKey = bundleId
    ? `bundle:${bundleId}`
    : appPath
    ? `path:${appPath}`
    : null;
  const [icon, setIcon] = useState<string | null>(() => {
    if (cacheKey && iconCache.has(cacheKey)) {
      return iconCache.get(cacheKey) ?? null;
    }
    return null;
  });

  useEffect(() => {
    if (!cacheKey || (!appPath && !bundleId)) {
      setIcon(null);
      return;
    }
    console.log("[AppIcon] request", { appName, appPath, bundleId, cacheKey });
    const cached = iconCache.get(cacheKey);
    if (cached !== undefined) {
      setIcon(cached);
      return;
    }
    let disposed = false;
    window.api
      ?.getAppIcon({ appPath: appPath ?? null, bundleId: bundleId ?? null })
      ?.then((res) => {
        if (disposed) return;
        iconCache.set(cacheKey, res ?? null);
        setIcon(res ?? null);
      })
      .catch(() => {
        if (disposed) return;
        iconCache.set(cacheKey, null);
        setIcon(null);
      });
    return () => {
      disposed = true;
    };
  }, [appPath, bundleId, cacheKey]);

  if (icon) {
    return (
      <img
        src={icon}
        alt={appName}
        width={size}
        height={size}
        className="rounded-md shadow-sm object-cover"
        draggable={false}
      />
    );
  }

  return (
    <div
      className="rounded-md bg-muted text-foreground/80 font-semibold grid place-items-center shadow-sm"
      style={{ width: size, height: size }}
    >
      <span className="text-xs">{appName}</span>
    </div>
  );
}
