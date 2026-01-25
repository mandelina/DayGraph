export const NAV_ITEMS = [
  { label: "Today", description: "즉시 이해" },
  { label: "Timeline", description: "정밀 분석" },
  { label: "Weekly", description: "패턴 비교" },
  { label: "Insights", description: "해석과 회고" },
  { label: "Settings", description: "기준과 제어" },
] as const;

export type NavItem = (typeof NAV_ITEMS)[number]["label"];
