import { useState, useEffect } from "react";
import { Sidebar } from "../shared/ui/Sidebar";
import { TodayPage } from "../pages/today/ui/TodayPage";
import { TimelinePage } from "../pages/timeline/ui/TimelinePage";
import { WeeklyPage } from "../pages/weekly/ui/WeeklyPage";
import { InsightsPage } from "../pages/insights/ui/InsightsPage";
import { SettingsPage } from "../pages/settings/ui/SettingsPage";
import type { NavItem } from "./navigation";
import { useActivityData } from "./providers/useActivityData";
import { useCollectorStatus } from "./providers/useCollectorStatus";
import { ThemeToggle } from "../shared/ui/ThemeToggle";

export default function App() {
  const [activeTab, setActiveTab] = useState<NavItem>("Today");
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("theme") as "dark" | "light") || "dark";
  });
  const {
    todayStats,
    timelineSlices,
    timelineBuckets,
    loadState,
    isUsingMockData,
    errorMessage,
  } = useActivityData();
  const collectorStatus = useCollectorStatus();

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
        theme={theme}
        setTheme={setTheme}
      />
      <main className="min-w-0 flex-1 overflow-y-auto px-4 pb-24 pt-4 sm:px-6 sm:pb-8 lg:px-10 lg:py-8">
        <div className="mx-auto w-full max-w-6xl space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div className="hidden text-xs font-bold uppercase tracking-[0.18em] text-muted sm:block">
              {activeTab} / Local-first intelligence
            </div>
            <div className="sm:ml-auto">
              <ThemeToggle theme={theme} setTheme={setTheme} />
            </div>
          </div>
          {activeTab === "Today" && (
            <TodayPage
              apps={todayStats}
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
        </div>
      </main>
    </div>
  );
}
