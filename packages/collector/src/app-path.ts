import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const bundlePathCache = new Map<string, string | null>();
const execFileAsync = promisify(execFile);

/**
 * bundleId 기준으로 Spotlight/폴더 스캔을 수행해 대표 앱 경로를 캐시한다.
 */
export async function resolveAppPathFromBundleId(bundleId: string) {
  if (bundlePathCache.has(bundleId)) {
    return bundlePathCache.get(bundleId) ?? null;
  }
  try {
    const spotlight = await runMdfind(bundleId);
    if (spotlight) {
      bundlePathCache.set(bundleId, spotlight);
      return spotlight;
    }
  } catch (err) {
    console.warn("[collector] mdfind failed", bundleId, err);
  }
  const fallback = await scanCommonAppDirs(bundleId);
  bundlePathCache.set(bundleId, fallback);
  return fallback;
}

/**
 * macOS Spotlight(mdfind)로 CFBundleIdentifier에 해당하는 .app 경로를 찾는다.
 */
async function runMdfind(bundleId: string): Promise<string | null> {
  const query = `kMDItemCFBundleIdentifier == "${bundleId}"`;
  const { stdout } = await execFileAsync("mdfind", [query]);
  const first = stdout
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.endsWith(".app"))[0];
  return first || null;
}

/**
 * Spotlight 실패 시 /Applications 등 대표 경로를 순회하며 번들을 찾는다.
 */
async function scanCommonAppDirs(bundleId: string) {
  const dirs = [
    "/Applications",
    join(homedir(), "Applications"),
    "/System/Applications",
  ];
  for (const dir of dirs) {
    const match = await findBundleInDir(dir, bundleId);
    if (match) return match;
  }
  return null;
}

/**
 * 주어진 디렉터리의 .app 폴더를 스캔해 Info.plist와 bundleId를 비교한다.
 */
async function findBundleInDir(baseDir: string, bundleId: string) {
  try {
    const entries = await fs.readdir(baseDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.endsWith(".app")) {
        const full = join(baseDir, entry.name);
        const id = await readBundleId(full);
        if (id === bundleId) return full;
      }
    }
  } catch {}
  return null;
}

/**
 * Info.plist에서 CFBundleIdentifier 문자열을 추출한다.
 */
async function readBundleId(appPath: string) {
  try {
    const plist = await fs.readFile(join(appPath, "Contents", "Info.plist"), "utf8");
    const match = plist.match(
      /<key>CFBundleIdentifier<\/key>\s*<string>([^<]+)<\/string>/
    );
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
