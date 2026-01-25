import { AppActivity } from "../../entities/activity/model";
import { formatSeconds } from "../../shared/lib/time";

type Props = {
  apps: AppActivity[];
};

export function RemainingAppsTable({ apps }: Props) {
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
