import { NAV_ITEMS, NavItem } from "../../app/navigation";

type Props = {
  active: NavItem;
  onSelect: (item: NavItem) => void;
  theme: "dark" | "light";
  setTheme: (value: "dark" | "light") => void;
};

export function Sidebar({ active, onSelect, theme, setTheme }: Props) {
  return (
    <aside className="w-64 border-r border-border bg-surfaceMuted/90 backdrop-blur-xl p-6 hidden md:flex flex-col gap-6">
      <div>
        <div className="text-2xl font-bold text-foreground">DayGraph</div>
        <div className="text-xs text-muted">Active Window Intelligence</div>
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
                  ? "bg-primary text-surface border-primary"
                  : "border-border bg-card text-foreground"
              }`}
            >
              <div className="text-sm font-semibold">{item.label}</div>
              <div
                className={`text-xs ${
                  isActive ? "text-surface/70" : "text-muted"
                }`}
              >
                {item.description}
              </div>
            </button>
          );
        })}
      </nav>
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="mt-auto w-full rounded-xl border border-border bg-card py-2 text-sm text-foreground transition hover:bg-cardMuted"
      >
        Theme: {theme === "dark" ? "Dark" : "Light"}
      </button>
    </aside>
  );
}
