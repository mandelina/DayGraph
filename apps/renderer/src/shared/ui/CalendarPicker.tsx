import { useEffect, useState } from "react";
import { formatLocalDateISO } from "../lib/time";
import {
  formatCalendarDate,
  formatCalendarMonth,
  getCalendarDays,
  getMonthISO,
  shiftMonth,
} from "../lib/calendar";

type Props = {
  selectedDate: string;
  onSelect: (dateISO: string) => void;
};

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

export function CalendarPicker({ selectedDate, onSelect }: Props) {
  const today = formatLocalDateISO();
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => getMonthISO(selectedDate));

  useEffect(() => {
    setVisibleMonth(getMonthISO(selectedDate));
  }, [selectedDate]);

  const days = getCalendarDays(visibleMonth, today);
  const selectedLabel =
    selectedDate === today ? "Today" : formatCalendarDate(selectedDate);

  function selectDate(dateISO: string) {
    onSelect(dateISO);
    setIsOpen(false);
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        aria-label="날짜 선택"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex h-10 max-w-[9.5rem] items-center gap-2 rounded-xl border border-line bg-card px-3 text-sm font-bold text-foreground shadow-sm transition hover:border-accent sm:max-w-none"
      >
        <span aria-hidden className="text-base leading-none text-accent">
          ▦
        </span>
        <span className="truncate">{selectedLabel}</span>
        <span aria-hidden className="text-xs text-muted">
          {isOpen ? "⌃" : "⌄"}
        </span>
      </button>

      {isOpen && (
        <section
          role="dialog"
          aria-label="Activity calendar"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-30 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-line bg-card p-4 shadow-[0_16px_40px_rgba(33,30,27,0.16)]"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted">
                Activity date
              </p>
              <h2 className="mt-1 text-base font-black text-foreground">
                {formatCalendarMonth(visibleMonth)}
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="이전 달"
                onClick={() => setVisibleMonth(shiftMonth(visibleMonth, -1))}
                className="grid h-8 w-8 place-items-center rounded-lg text-lg text-muted transition hover:bg-cardMuted hover:text-foreground"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="다음 달"
                onClick={() => setVisibleMonth(shiftMonth(visibleMonth, 1))}
                className="grid h-8 w-8 place-items-center rounded-lg text-lg text-muted transition hover:bg-cardMuted hover:text-foreground"
              >
                ›
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 text-center text-[10px] font-black uppercase tracking-[0.08em] text-muted">
            {weekdays.map((weekday) => (
              <span key={weekday} className="pb-2">
                {weekday}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const isSelected = day.iso === selectedDate;
              return (
                <button
                  key={day.iso}
                  type="button"
                  aria-label={`${formatCalendarDate(day.iso)} 활동 보기`}
                  aria-pressed={isSelected}
                  onClick={() => selectDate(day.iso)}
                  className={`relative grid h-8 place-items-center rounded-lg text-xs font-bold transition ${
                    isSelected
                      ? "bg-foreground text-surface"
                      : day.isToday
                        ? "bg-accentSoft/25 text-accent"
                        : "text-foreground hover:bg-cardMuted"
                  } ${day.isCurrentMonth ? "" : "opacity-35"}`}
                >
                  {day.day}
                  {day.isToday && !isSelected && (
                    <span
                      aria-hidden
                      className="absolute bottom-1 h-1 w-1 rounded-full bg-accent"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
            <span className="text-xs text-muted">날짜를 선택해 활동 보기</span>
            <button
              type="button"
              onClick={() => selectDate(today)}
              className="rounded-lg px-2.5 py-1.5 text-xs font-black text-accent transition hover:bg-accentSoft"
            >
              오늘로 이동
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
