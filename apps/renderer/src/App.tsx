import { useEffect, useState } from "react";
import { Timeline } from "./components/Timeline";

type Activity = {
  timestamp: string;
  app_name: string;
  window_title: string;
  display_id: number | null;
  clicks: number;
  keypress: number;
};

export default function App() {
  const [data, setData] = useState<Activity[]>([]);

  useEffect(() => {
    const todayISO = new Date().toISOString().slice(0, 10);
    // Electron preload로 노출된 API 호출
    window.api
      ?.queryDay(todayISO)
      ?.then((res: any) => {
        setData(Array.isArray(res) ? res : []);
      })
      .catch(() => setData([]));
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">DayGraph — Activity Timeline</h1>
      <Timeline data={data} />
    </div>
  );
}
