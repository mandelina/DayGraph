import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import { formatError } from "./errors";
import { importOptionalModule } from "./optional-import";

const prebuiltInputHelpers = {
  darwin: fileURLToPath(new URL("../bin/darwin/daygraph-input-helper", import.meta.url)),
} as const;

let clicks = 0;
let keypress = 0;
let inputHelperProcess: ReturnType<typeof spawn> | null = null;
let inputBackend = "noop";
let inputBackendError: string | null = null;
let stopInputBackend: (() => void) | null = null;

export async function setupInputHooks() {
  if (process.platform !== "darwin") {
    await setupUiohookInputHooks();
    return;
  }
  try {
    const binary = await getPrebuiltInputHelperPath();
    await startMacInputHelper(binary);
    inputBackend = "macos-event-tap";
    inputBackendError = null;
    console.log("[collector][input] backend ready", inputBackend);
  } catch (err) {
    inputBackend = "noop";
    inputBackendError = formatError(err);
    console.error("[collector][input] helper setup failed", err);
  }
}

export function stopInputHooks() {
  if (stopInputBackend) {
    stopInputBackend();
    stopInputBackend = null;
  }
  if (inputHelperProcess && !inputHelperProcess.killed) {
    inputHelperProcess.kill();
  }
}

export function readInputCounts() {
  return {
    clicks,
    keypress,
  };
}

export function resetInputCounts() {
  clicks = 0;
  keypress = 0;
}

export function getInputStatus() {
  return {
    inputBackend,
    inputBackendError,
  };
}

async function setupUiohookInputHooks() {
  try {
    const mod = await importOptionalModule<any>("uiohook-napi");
    const uiohook = mod.uIOhook ?? mod.default?.uIOhook ?? mod.default ?? mod;
    if (
      typeof uiohook.on !== "function" ||
      typeof uiohook.start !== "function"
    ) {
      throw new Error("uiohook-napi module does not expose on/start");
    }

    uiohook.on("mousedown", () => {
      clicks += 1;
    });
    uiohook.on("keydown", () => {
      keypress += 1;
    });
    uiohook.start();
    stopInputBackend = () => {
      if (typeof uiohook.stop === "function") {
        uiohook.stop();
      }
    };
    inputBackend = `uiohook-${process.platform}`;
    inputBackendError = null;
    console.log("[collector][input] backend ready", inputBackend);
  } catch (err) {
    inputBackend = "noop";
    inputBackendError = `uiohook unavailable on ${process.platform}: ${formatError(
      err
    )}`;
    console.warn("[collector][input]", inputBackendError);
  }
}

async function getPrebuiltInputHelperPath() {
  const binaryPath = prebuiltInputHelpers.darwin;
  try {
    await fs.access(binaryPath);
  } catch {
    throw new Error(
      `missing prebuilt input helper: ${binaryPath}. Run 'pnpm -C packages/collector build:helper:darwin'.`
    );
  }
  return binaryPath;
}

async function startMacInputHelper(binaryPath: string) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(binaryPath, [], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    inputHelperProcess = child;

    const lines = createInterface({ input: child.stdout });
    lines.on("line", (line) => {
      if (line === "k") {
        keypress += 1;
        return;
      }
      if (line === "c") {
        clicks += 1;
        return;
      }
      if (line) {
        console.warn("[collector][input] unknown event", line);
      }
    });

    child.stderr.on("data", (chunk) => {
      const message = chunk.toString().trim();
      if (message) {
        console.warn("[collector][input]", message);
      }
    });

    let settled = false;
    const readyTimer = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve();
      }
    }, 150);

    child.once("error", (err) => {
      clearTimeout(readyTimer);
      lines.close();
      inputHelperProcess = null;
      if (!settled) {
        settled = true;
        reject(err);
      }
    });

    child.once("exit", (code, signal) => {
      clearTimeout(readyTimer);
      lines.close();
      inputHelperProcess = null;
      const reason = `helper exited (code=${code ?? "null"}, signal=${
        signal ?? "null"
      })`;
      inputBackend = "noop";
      inputBackendError = reason;
      if (!settled) {
        settled = true;
        reject(new Error(reason));
        return;
      }
      console.warn("[collector][input]", reason);
    });
  });
}
