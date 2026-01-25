import { useMemo } from "react";

type Activity = {
  timestamp: string;
  app_name: string;
  window_title: string;
  display_id: number | null;
  clicks: number;
  keypress: number;
};

type AppActivity = {
  appName: string;
  activeSeconds: number;
  clickCount: number;
  keypressCount: number;
  score: number;
};

const ACTIVE_WEIGHT = 1;
const CLICK_WEIGHT = 2;
const KEYPRESS_WEIGHT = 0.5;
const NAV_ITEMS = [
  { label: "Today", description: "즉시 이해" },
  { label: "Timeline", description: "정밀 분석" },
  { label: "Weekly", description: "패턴 비교" },
  { label: "Insights", description: "해석과 회고" },
  { label: "Settings", description: "기준과 제어" },
];

// UI 확인용으로 1분치 목데이터 생성
function useMockData(): Activity[] {
  return useMemo(() => {
    const now = Date.now();
    return Array.from({ length: 60 }, (_, idx) => {
      const timestamp = new Date(now - (59 - idx) * 1000).toISOString();
      return {
        timestamp,
        app_name: idx % 2 === 0 ? "VSCode" : "Chrome",
        window_title: idx % 2 === 0 ? "main.ts — DayGraph" : "Docs — DayGraph",
        display_id: idx % 3 === 0 ? 0 : 1,
        clicks: (idx % 5) + 1,
        keypress: (idx % 7) + 2,
      };
    });
  }, []);
}

export default function App() {
  const data = useMockData();
  const stats = useMemo(() => summarizeByApp(data), [data]);
  const topApps = stats.slice(0, 5);
  const remainingApps = topApps.slice(1);

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        <header className="bg-yellow-300 text-black px-4 py-3 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-sm uppercase tracking-wide">Today</div>
            <div className="text-2xl font-bold">오늘 집중한 앱</div>
          </div>
          <div className="text-sm text-black/70">Activity Intensity Dashboard</div>
        </header>
        <TopAppsStrip apps={topApps} />
        <RemainingAppsTable apps={remainingApps} />
      </main>
    </div>
  );
}

function summarizeByApp(data: Activity[]): AppActivity[] {
  const map = new Map<string, Omit<AppActivity, "score"> & { score: number }>();
  data.forEach((item) => {
    if (!map.has(item.app_name)) {
      map.set(item.app_name, {
        appName: item.app_name,
        activeSeconds: 0,
        clickCount: 0,
        keypressCount: 0,
        score: 0,
      });
    }
    const target = map.get(item.app_name)!;
    target.activeSeconds += 1; // 1초 단위 샘플이므로 1초 추가
    target.clickCount += item.clicks;
    target.keypressCount += item.keypress;
  });

  return Array.from(map.values())
    .map((entry) => {
      const weighted =
        entry.activeSeconds * ACTIVE_WEIGHT +
        entry.clickCount * CLICK_WEIGHT +
        entry.keypressCount * KEYPRESS_WEIGHT;
      return { ...entry, score: Number(weighted.toFixed(1)) };
    })
    .sort((a, b) => b.score - a.score);
}

function Sidebar() {
  return (
    <aside className="w-64 border-r border-white/10 bg-zinc-900/80 backdrop-blur-xl p-6 hidden md:flex flex-col gap-6">
      <div>
        <div className="text-2xl font-bold">DayGraph</div>
        <div className="text-xs text-white/60">Active Window Intelligence</div>
      </div>
      <nav className="space-y-2">
        {NAV_ITEMS.map((item, idx) => {
          const isActive = idx === 0; // Today 활성화
          return (
            <div
              key={item.label}
              className={`rounded-xl px-4 py-3 transition border ${
                isActive
                  ? "bg-yellow-300 text-black border-yellow-300"
                  : "border-white/10 bg-white/5 text-white"
              }`}
            >
              <div className="text-sm font-semibold">{item.label}</div>
              <div
                className={`text-xs ${
                  isActive ? "text-black/70" : "text-white/60"
                }`}
              >
                {item.description}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

function TopAppsStrip({ apps }: { apps: AppActivity[] }) {
  if (apps.length === 0) {
    return (
      <section className="bg-white/10 rounded-xl p-6 text-white">
        오늘 활동 데이터가 없습니다.
      </section>
    );
  }

  const [hero] = apps;

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between text-white">
        <h2 className="text-lg font-semibold">Top Apps</h2>
        <span className="text-sm text-white/60">
          Activity Score 상위 {apps.length}개
        </span>
      </div>
      {hero && <HeroAppCard app={hero} rank={1} />}
    </section>
  );
}

function HeroAppCard({ app, rank }: { app: AppActivity; rank: number }) {
  const segments = [
    {
      label: "Active",
      value: app.activeSeconds * ACTIVE_WEIGHT,
      color: "bg-emerald-400",
    },
    {
      label: "Clicks",
      value: app.clickCount * CLICK_WEIGHT,
      color: "bg-sky-400",
    },
    {
      label: "Keys",
      value: app.keypressCount * KEYPRESS_WEIGHT,
      color: "bg-fuchsia-400",
    },
  ];
  const total = segments.reduce((sum, seg) => sum + seg.value, 0) || 1;

  return (
    <article className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white rounded-2xl p-6 shadow-2xl border border-white/10 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs uppercase tracking-wide text-white/60">
            #{rank} Today Focus
          </span>
          <div className="text-3xl font-bold mt-1">{app.appName}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/60">Activity Score</div>
          <div className="text-4xl font-black text-amber-300">
            {app.score.toFixed(1)}
          </div>
          <div className="text-xs text-white/60 mt-1">
            Active {formatSeconds(app.activeSeconds)}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-xs text-white/60 mb-1">Clicks</div>
          <div className="text-xl font-semibold">{app.clickCount}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-xs text-white/60 mb-1">Keys</div>
          <div className="text-xl font-semibold">{app.keypressCount}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-xs text-white/60 mb-1">Active Time</div>
          <div className="text-xl font-semibold">
            {formatSeconds(app.activeSeconds)}
          </div>
        </div>
      </div>
      <div>
        <div className="text-xs text-white/60 mb-2">점수 구성 비율</div>
        <div className="flex h-3 overflow-hidden rounded-full bg-white/10">
          {segments.map((seg) => (
            <div
              key={seg.label}
              className={seg.color}
              style={{ width: `${(seg.value / total) * 100}%` }}
              title={`${seg.label}: ${seg.value.toFixed(1)}`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-white/60 mt-1">
          {segments.map((seg) => (
            <span key={seg.label}>
              {seg.label}: {((seg.value / total) * 100).toFixed(0)}%
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

function RemainingAppsTable({ apps }: { apps: AppActivity[] }) {
  if (apps.length === 0) return null;
  return (
    <section className="bg-white/5 rounded-xl p-4 text-white">
      <h2 className="text-lg font-semibold mb-4">2위 이하 순위 요약</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-white/70">
            <tr>
              <th className="px-3 py-2 text-left">Rank</th>
              <th className="px-3 py-2 text-left">App</th>
              <th className="px-3 py-2 text-right">Active Time</th>
              <th className="px-3 py-2 text-right">Clicks</th>
              <th className="px-3 py-2 text-right">Keypress</th>
              <th className="px-3 py-2 text-right">Activity Score</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((app, idx) => (
              <tr
                key={app.appName}
                className="border-t border-white/10 hover:bg-white/10 transition"
              >
                <td className="px-3 py-2 text-left font-semibold">
                  #{idx + 2}
                </td>
                <td className="px-3 py-2 text-left">{app.appName}</td>
                <td className="px-3 py-2 text-right">
                  {formatSeconds(app.activeSeconds)}
                </td>
                <td className="px-3 py-2 text-right">{app.clickCount}</td>
                <td className="px-3 py-2 text-right">{app.keypressCount}</td>
                <td className="px-3 py-2 text-right">{app.score.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function formatSeconds(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${remaining}s`;
}
