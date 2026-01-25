type Props = {
  theme: "dark" | "light";
  setTheme: (value: "dark" | "light") => void;
};

export function ThemeToggle({ theme, setTheme }: Props) {
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground transition hover:bg-cardMuted"
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
