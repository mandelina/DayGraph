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
    Timeline: "집중도 시간대 분석",
    Weekly: "이번 주 집중 패턴 요약",
    Insights: "집중 패턴 자동 해석",
    Settings: "DayGraph 기준과 제어",
  };
  const checks = {
    title: document.title === "DayGraph",
    api: ["queryDay", "queryRange", "getAppIcon", "getCollectorStatus", "openDataDir"]
      .every((key) => typeof window.api?.[key] === "function"),
    collector: false,
    todayThumbnails: false,
    workspaceThumbnail: false,
    activeNavIcon: false,
    calendar: false,
    activeCalendarColor: false,
    dateSelection: false,
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
    await new Promise((resolve) =>
      setTimeout(resolve, tab === "Today" ? 500 : 120),
    );
    if (tab === "Today") {
      const dateToggle = document.querySelector('button[aria-label="날짜 선택"]');
      dateToggle?.click();
      if (dateToggle) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      checks.calendar =
        Boolean(document.querySelector('[aria-label="Activity calendar"]')) &&
        document.querySelectorAll('button[aria-label*="활동 보기"]').length >= 28;
      const activeCalendarDay = document.querySelector(
        'button[aria-label*="활동 보기"][aria-pressed="true"]',
      );
      if (activeCalendarDay) {
        const dayStyle = getComputedStyle(activeCalendarDay);
        checks.activeCalendarColor = dayStyle.color !== dayStyle.backgroundColor;
      }
      const todayReset = [...document.querySelectorAll("button")].find(
        (item) => item.innerText.includes("오늘로 이동"),
      );
      todayReset?.click();
      if (todayReset) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
    checks.tabs[tab] = document.body.innerText.includes(heading);
    if (tab === "Today") {
      const emptyToday = document.body.innerText.includes(
        "오늘 활동 데이터가 없습니다.",
      );
      checks.todayThumbnails =
        emptyToday || document.querySelectorAll("main img[alt]").length > 0;
      checks.workspaceThumbnail =
        emptyToday || document.querySelectorAll("aside img[alt]").length > 0;
      const reopenForSelection = document.querySelector('button[aria-label="날짜 선택"]');
      reopenForSelection?.click();
      if (reopenForSelection) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      const otherDate = [...document.querySelectorAll('button[aria-label*="활동 보기"]')]
        .find((item) => item.getAttribute("aria-pressed") !== "true");
      otherDate?.click();
      if (otherDate) {
        await new Promise((resolve) => setTimeout(resolve, 250));
        checks.dateSelection =
          document.querySelector("h1")?.innerText.includes("활동") === true &&
          !document.querySelector('button[aria-label="날짜 선택"]')?.innerText.includes("Today");
        const reopenCalendar = document.querySelector('button[aria-label="날짜 선택"]');
        reopenCalendar?.click();
        if (reopenCalendar) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        const backToToday = [...document.querySelectorAll("button")].find(
          (item) => item.innerText.includes("오늘로 이동"),
        );
        backToToday?.click();
        if (backToToday) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    }
    if (tab === "Settings") {
      const activeNav = document.querySelector(
        'aside button[aria-current="page"]',
      );
      const activeIcon = activeNav?.querySelector(":scope > span");
      if (activeIcon) {
        const iconStyle = getComputedStyle(activeIcon);
        checks.activeNavIcon = iconStyle.color !== iconStyle.backgroundColor;
      }
    }
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
