import { formatLocalDateISO } from "./time";

export type CalendarDay = {
  iso: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
};

function parseLocalDate(dateISO: string) {
  const [year, month, day] = dateISO.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getMonthISO(dateISO: string) {
  const date = parseLocalDate(dateISO);
  return formatLocalDateISO(new Date(date.getFullYear(), date.getMonth(), 1));
}

export function shiftMonth(monthISO: string, offset: number) {
  const date = parseLocalDate(monthISO);
  return formatLocalDateISO(
    new Date(date.getFullYear(), date.getMonth() + offset, 1),
  );
}

export function getCalendarDays(
  monthISO: string,
  todayISO = formatLocalDateISO(),
): CalendarDay[] {
  const monthDate = parseLocalDate(monthISO);
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const gridStart = new Date(year, month, 1 - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return {
      iso: formatLocalDateISO(date),
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      isToday: formatLocalDateISO(date) === todayISO,
    };
  });
}

export function formatCalendarMonth(monthISO: string) {
  return parseLocalDate(monthISO).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
  });
}

export function formatCalendarDate(dateISO: string) {
  return parseLocalDate(dateISO).toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}
