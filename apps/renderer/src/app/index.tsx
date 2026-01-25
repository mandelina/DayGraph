import { useState, useMemo } from "react";
import { Sidebar } from "../shared/ui/Sidebar";
import { TodayPage } from "../pages/today/ui/TodayPage";
import { TimelinePage } from "../pages/timeline/ui/TimelinePage";
import { WeeklyPage } from "../pages/weekly/ui/WeeklyPage";
import { InsightsPage } from "../pages/insights/ui/InsightsPage";
import { SettingsPage } from "../pages/settings/ui/SettingsPage";
import { NAV_ITEMS, NavItem } from "./navigation";
import { useTodayMock, useTimelineMock } from "./providers/mock-data";
import { summarizeByApp } from "../entities/activity/lib/calculateScore";

export default function App() {
  const [activeTab, setActiveTab] = useState<NavItem>("Today");
  const activities = useTodayMock();
  const timelineSlices = useTimelineMock();
  const stats = useMemo(() => summarizeByApp(activities), [activities]);

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar active={activeTab} onSelect={setActiveTab} />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        {activeTab === "Today" && <TodayPage apps={stats} />}
        {activeTab === "Timeline" && <TimelinePage slices={timelineSlices} />}
        {activeTab === "Weekly" && <WeeklyPage />}
        {activeTab === "Insights" && <InsightsPage />}
        {activeTab === "Settings" && <SettingsPage />}
      </main>
    </div>
  );
}
