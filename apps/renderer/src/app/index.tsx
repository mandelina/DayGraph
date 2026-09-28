import { lazy, Suspense, useState, useEffect } from "react";
import { Sidebar } from "../shared/ui/Sidebar";
import { TodayPage } from "../pages/today/ui/TodayPage";
import type { NavItem } from "./navigation";
import { useActivityData } from "./providers/useActivityData";
import { useCollectorStatus } from "./providers/useCollectorStatus";
import { ThemeToggle } from "../shared/ui/ThemeToggle";
import { CalendarPicker } from "../shared/ui/CalendarPicker";
import { formatLocalDateISO } from "../shared/lib/time";

const TimelinePage = lazy(() =>
  import("../pages/timeline/ui/TimelinePage").then((module) => ({
    default: module.TimelinePage,
  })),
);
const WeeklyPage = lazy(() =>
  import("../pages/weekly/ui/WeeklyPage").then((module) => ({
    default: module.WeeklyPage,
  })),
);
const InsightsPage = lazy(() =>
  import("../pages/insights/ui/InsightsPage").then((module) => ({
    default: module.InsightsPage,
  })),
);
const SettingsPage = lazy(() =>
  import("../pages/settings/ui/SettingsPage").then((module) => ({
    default: module.SettingsPage,
  })),
);

export default function App() {
  const [activeTab, setActiveTab] = useState<NavItem>("Today");
  const [selectedDate, setSelectedDate] = useState(() => formatLocalDateISO());
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("theme") as "dark" | "light") || "light";
  });
  const {
    todayStats,
    timelineSlices,
    timelineBuckets,
    loadState,
    isUsingMockData,
    errorMessage,
  } = useActivityData(
    selectedDate,
    activeTab === "Today" || activeTab === "Timeline",
  );
  const collectorStatus = useCollectorStatus(
    activeTab !== "Weekly" && activeTab !== "Insights",
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log("[Today][dev] stats", todayStats);
      console.log("[Timeline][dev] slices", timelineSlices.length);
      console.log("[Timeline][dev] buckets", timelineBuckets.length);
    }
  }, [todayStats, timelineSlices, timelineBuckets]);

  return (
    <div className="app-canvas flex min-h-screen text-foreground">
      <Sidebar
        active={activeTab}
        onSelect={setActiveTab}
        workspaceApp={todayStats[0]}
      />
      <main className="min-w-0 flex-1 overflow-y-auto px-4 pb-24 pt-4 sm:px-6 sm:pb-8 lg:px-10 lg:py-8">
        <div className="mx-auto w-full max-w-6xl space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div className="hidden text-xs font-bold uppercase tracking-[0.18em] text-muted sm:block">
              {activeTab} / Local activity journal
            </div>
            <div className="flex items-center gap-2 sm:ml-auto">
              <CalendarPicker
                selectedDate={selectedDate}
                onSelect={setSelectedDate}
              />
              <ThemeToggle theme={theme} setTheme={setTheme} />
            </div>
          </div>
          <Suspense fallback={<PageLoading />}>
            {activeTab === "Today" && (
              <TodayPage
                apps={todayStats}
                selectedDate={selectedDate}
                loadState={loadState}
                isUsingMockData={isUsingMockData}
                errorMessage={errorMessage}
                collectorStatus={collectorStatus}
              />
            )}
            {activeTab === "Timeline" && (
              <TimelinePage
                slices={timelineSlices}
                buckets={timelineBuckets}
                selectedDate={selectedDate}
                loadState={loadState}
                isUsingMockData={isUsingMockData}
                errorMessage={errorMessage}
                collectorStatus={collectorStatus}
              />
            )}
            {activeTab === "Weekly" && <WeeklyPage />}
            {activeTab === "Insights" && <InsightsPage />}
            {activeTab === "Settings" && (
              <SettingsPage theme={theme} collectorStatus={collectorStatus} />
            )}
          </Suspense>
        </div>
      </main>
    </div>
  );
}

function PageLoading() {
  return (
    <section className="status-banner status-banner-neutral">
      <span className="status-banner-dot" aria-hidden />
      <span>화면을 불러오는 중입니다.</span>
    </section>
  );
}
