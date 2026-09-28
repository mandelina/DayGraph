import { cp, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const helperSource = resolve(root, "packages/collector/bin/darwin");
const helperTarget = resolve(root, "apps/electron/dist/bin/darwin");

await mkdir(helperTarget, { recursive: true });
await cp(helperSource, helperTarget, { recursive: true, force: true });
