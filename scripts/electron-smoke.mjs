const port = process.env.ELECTRON_REMOTE_DEBUGGING_PORT || "9222";
const listURL = `http://127.0.0.1:${port}/json/list`;
const targets = await fetch(listURL).then((response) => {
  if (!response.ok) throw new Error(`CDP target lookup failed: ${response.status}`);
  return response.json();
});
const target = targets.find((item) => item.type === "page");
if (!target?.webSocketDebuggerUrl) {
  throw new Error(`No Electron page target found at ${listURL}`);
}

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let nextId = 0;
const pending = new Map();
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  const resolve = pending.get(message.id);
  if (!resolve) return;
  pending.delete(message.id);
  resolve(message);
});

const evaluate = (expression) =>
  new Promise((resolve) => {
    const id = ++nextId;
    pending.set(id, resolve);
    socket.send(
      JSON.stringify({
        id,
        method: "Runtime.evaluate",
        params: {
          expression,
          returnByValue: true,
          awaitPromise: true,
        },
      }),
    );
  });

const result = await evaluate(`(async()=>{
  const expectedTabs = {
    Today: "오늘 집중한 앱",
    Timeline: "정밀 Activity Timeline",
    Weekly: "이번 주 집중 패턴 요약",
    Insights: "집중 패턴 자동 해석",
    Settings: "DayGraph 기준과 제어",
  };
  const checks = {
    title: document.title === "DayGraph",
    api: ["queryDay", "queryRange", "getAppIcon", "getCollectorStatus", "openDataDir"]
      .every((key) => typeof window.api?.[key] === "function"),
    collector: false,
    tabs: {},
  };
  const status = await window.api?.getCollectorStatus?.();
  checks.collector = status?.reachable === true && status.dataQuality === "real";
  for (const [tab, heading] of Object.entries(expectedTabs)) {
    const button = [...document.querySelectorAll("button")]
      .find((item) => item.innerText.includes(tab));
    if (!button) {
      checks.tabs[tab] = false;
      continue;
    }
    button.click();
    await new Promise((resolve) => setTimeout(resolve, 120));
    checks.tabs[tab] = document.body.innerText.includes(heading);
  }
  return { checks, status };
})()`);

const value = result.result?.result?.value;
if (!value || result.result?.exceptionDetails) {
  throw new Error(result.result?.exceptionDetails?.text || "Electron smoke evaluation failed");
}

console.log(JSON.stringify(value, null, 2));
socket.close();

const checks = Object.values(value.checks);
const passed = checks.every((check) =>
  typeof check === "boolean" ? check : Object.values(check).every(Boolean),
);
if (!passed) process.exitCode = 1;
