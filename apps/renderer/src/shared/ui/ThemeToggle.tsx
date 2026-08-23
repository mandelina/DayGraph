type Props = {
  theme: "dark" | "light";
  setTheme: (value: "dark" | "light") => void;
};

export function ThemeToggle({ theme, setTheme }: Props) {
  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/75 px-4 py-2 text-sm font-semibold text-foreground shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-cardMuted"
    >
      <span
        className={`h-3 w-3 rounded-full ${
          theme === "dark" ? "bg-primary" : "bg-accent"
        }`}
      />
      <span>{theme === "dark" ? "Dark" : "Light"} mode</span>
    </button>
  );
}
