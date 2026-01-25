import { NAV_ITEMS, NavItem } from "../../app/navigation";

type Props = {
  active: NavItem;
  onSelect: (item: NavItem) => void;
};

export function Sidebar({ active, onSelect }: Props) {
  return (
    <aside className="w-64 border-r border-white/10 bg-zinc-900/80 backdrop-blur-xl p-6 hidden md:flex flex-col gap-6">
      <div>
        <div className="text-2xl font-bold">DayGraph</div>
        <div className="text-xs text-white/60">Active Window Intelligence</div>
      </div>
      <nav className="space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = item.label === active;
          return (
            <button
              key={item.label}
              onClick={() => onSelect(item.label)}
              className={`w-full text-left rounded-xl px-4 py-3 transition border ${
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
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
