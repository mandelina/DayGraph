import { useState, useEffect } from "react";
import { Sidebar } from "../shared/ui/Sidebar";
import { TodayPage } from "../pages/today/ui/TodayPage";
import { TimelinePage } from "../pages/timeline/ui/TimelinePage";
import { WeeklyPage } from "../pages/weekly/ui/WeeklyPage";
import { InsightsPage } from "../pages/insights/ui/InsightsPage";
import { SettingsPage } from "../pages/settings/ui/SettingsPage";
import { NAV_ITEMS, NavItem } from "./navigation";
import { useTodayData, useTimelineMock } from "./providers/useTodayData";
import { ThemeToggle } from "../shared/ui/ThemeToggle";

export default function App() {
  const [activeTab, setActiveTab] = useState<NavItem>("Today");
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("theme") as "dark" | "light") || "dark";
  });
  const todayStats = useTodayData();
  const timelineSlices = useTimelineMock();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="flex min-h-screen bg-surface text-foreground">
      <Sidebar active={activeTab} onSelect={setActiveTab} theme={theme} setTheme={setTheme} />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="flex justify-end">
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
        {activeTab === "Today" && <TodayPage apps={todayStats} />}
        {activeTab === "Timeline" && <TimelinePage slices={timelineSlices} />}
        {activeTab === "Weekly" && <WeeklyPage />}
        {activeTab === "Insights" && <InsightsPage />}
        {activeTab === "Settings" && <SettingsPage />}
      </main>
    </div>
  );
}
