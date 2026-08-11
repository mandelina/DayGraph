import { importOptionalModule } from "./optional-import";

export type WindowBounds = { x: number; y: number; width: number; height: number };

export type ActiveWindowInfo = {
  app: string;
  path: string | null;
  bundleId: string | null;
  title: string;
  bounds?: WindowBounds | undefined;
};

const fallbackApps = ["Cat", "Rabbit", "Hamster"];

// active-win 실패 시에도 collector loop가 살아 있도록 목업 값을 반환한다.
export async function getActiveWindow(): Promise<ActiveWindowInfo> {
  try {
    const mod = await importOptionalModule<any>("active-win");
    const res = await (mod.default as any)();

    return {
      app: res.owner?.name ?? "Unknown",
      path: res.owner?.path ?? null,
      bundleId: res.owner?.bundleId ?? null,
      title: res.title ?? "Unknown",
      bounds: res.bounds as WindowBounds | undefined,
    };
  } catch (e) {
    console.log("res error : ", e);

    const i = Math.floor(Date.now() / 5000) % fallbackApps.length;
    return {
      app: fallbackApps[i],
      path: null,
      bundleId: null,
      title: `${fallbackApps[i]} — Mock`,
      bounds: { x: 0, y: 0, width: 100, height: 100 },
    };
  }
}
