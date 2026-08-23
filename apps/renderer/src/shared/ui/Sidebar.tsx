import { NAV_ITEMS, NavItem } from "../../app/navigation";
import type { AppActivity } from "../../entities/activity/model";
import { AppIcon } from "./AppIcon";

type Props = {
  active: NavItem;
  onSelect: (item: NavItem) => void;
  workspaceApp?: AppActivity;
};

export function Sidebar({
  active,
  onSelect,
  workspaceApp,
}: Props) {
  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col gap-8 border-r border-border/70 bg-surfaceMuted/65 p-6 backdrop-blur-xl md:flex">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-xl font-black text-surface shadow-lg shadow-primary/15">
            DG
          </div>
          <div>
            <div className="text-xl font-black tracking-tight text-foreground">
              DayGraph
            </div>
            <div className="mt-1 text-xs leading-5 text-muted">
              Local activity journal
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card/60 p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-muted">
            Workspace
          </div>
          <button
            type="button"
            aria-label="Open Today workspace"
            onClick={() => onSelect("Today")}
            className="mt-3 flex w-full items-center gap-3 rounded-xl text-left transition hover:opacity-80"
          >
            <AppIcon
              appName={workspaceApp?.appName ?? "DayGraph"}
              appPath={workspaceApp?.appPath}
              bundleId={workspaceApp?.bundleId}
              size={34}
            />
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-foreground">
                {workspaceApp?.appName ?? "Local workspace"}
              </span>
              <span className="mt-1 flex items-center gap-1.5 text-[11px] text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
                Local / Private
              </span>
            </span>
          </button>
        </div>
        <nav className="space-y-2" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => (
            <NavButton
              key={item.label}
              item={item}
              active={active}
              onSelect={onSelect}
            />
          ))}
        </nav>
      </aside>
      <nav
        className="fixed inset-x-3 bottom-3 z-20 grid grid-cols-5 gap-1 rounded-2xl border border-border/80 bg-card/95 p-1.5 shadow-2xl backdrop-blur-xl md:hidden"
        aria-label="Mobile navigation"
      >
        {NAV_ITEMS.map((item) => (
          <NavButton
            key={item.label}
            item={item}
            active={active}
            onSelect={onSelect}
            mobile
          />
        ))}
      </nav>
    </>
  );
}

function NavButton({
  item,
  active,
  onSelect,
  mobile = false,
}: {
  item: (typeof NAV_ITEMS)[number];
  active: NavItem;
  onSelect: (item: NavItem) => void;
  mobile?: boolean;
}) {
  const isActive = item.label === active;
  const glyph = NAV_GLYPHS[item.label];
  return (
    <button
      type="button"
      aria-current={isActive ? "page" : undefined}
      aria-label={mobile ? item.label : `${item.label} ${item.description}`}
      onClick={() => onSelect(item.label)}
      className={`transition ${
        mobile
          ? "flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-bold"
          : "flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left"
      } ${
        isActive
          ? mobile
            ? "bg-foreground text-surface"
            : "border-foreground bg-foreground text-surface shadow-lg shadow-foreground/10"
          : mobile
            ? "text-muted hover:bg-cardMuted"
            : "border-transparent text-foreground hover:border-border hover:bg-card"
      }`}
    >
      <span
        aria-hidden="true"
        className={
          mobile
            ? "text-base leading-none"
            : `grid h-8 w-8 place-items-center rounded-xl text-sm ${
                isActive
                  ? "bg-surface text-foreground"
                  : "bg-cardMuted text-foreground"
              }`
        }
      >
        {glyph}
      </span>
      <span className={mobile ? "truncate" : "min-w-0"}>
        <span className="block text-sm font-bold">{item.label}</span>
        {!mobile ? <span className="mt-0.5 block text-xs opacity-60">{item.description}</span> : null}
      </span>
    </button>
  );
}

const NAV_GLYPHS: Record<NavItem, string> = {
  Today: "◉",
  Timeline: "◌",
  Weekly: "▦",
  Insights: "✦",
  Settings: "⚙",
};
