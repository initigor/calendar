"use client";

import { DAY_LABELS, chunk, dateKey, getMonthGrid, isSameMonth, isToday } from "@/lib/date-utils";
import { colorForUser } from "@/lib/colors";
import { useTheme } from "@/components/ThemeProvider";
import type { CalendarEvent } from "@/lib/types";

export default function MonthView({
  anchor,
  eventsByDate,
  onSelectDay,
}: {
  anchor: Date;
  eventsByDate: Record<string, CalendarEvent[]>;
  onSelectDay: (date: Date) => void;
}) {
  const days = getMonthGrid(anchor);
  const weeks = chunk(days, 7);
  const { theme } = useTheme();

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-6 pb-6">
      <div className="grid grid-cols-7 text-center text-[11px] sm:text-xs font-medium text-gray-400 mb-1">
        {DAY_LABELS.map((d) => (
          <div key={d} className="py-1.5">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-[3px] sm:gap-1.5">
        {weeks.flat().map((day) => {
          const key = dateKey(day);
          const dayEvents = eventsByDate[key] ?? [];
          const inMonth = isSameMonth(day, anchor);
          const today = isToday(day);
          const visible = dayEvents.slice(0, 3);
          const overflow = dayEvents.length - visible.length;

          return (
            <button
              key={key}
              onClick={() => onSelectDay(day)}
              className={`min-h-[68px] sm:min-h-[92px] rounded-lg sm:rounded-xl text-left p-1 sm:p-1.5 bg-white/60 active:bg-gray-100 transition flex flex-col ${
                !inMonth ? "opacity-40" : ""
              }`}
            >
              <span
                className={`inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[11px] sm:text-xs font-medium mb-0.5 ${
                  today ? "bg-red-500 text-white" : "text-ink"
                }`}
              >
                {day.getDate()}
              </span>
              <div className="flex flex-col gap-[2px] overflow-hidden flex-1">
                {visible.map((ev) => {
                  const color = colorForUser(ev.owner_user_id, theme);
                  return (
                    <span
                      key={ev.id}
                      className={`text-[9px] sm:text-[11px] leading-tight truncate px-1 py-[1px] rounded ${color.bg} ${color.text} border-l-2 ${color.border}`}
                    >
                      {ev.judul}
                    </span>
                  );
                })}
                {overflow > 0 && (
                  <span className="text-[9px] sm:text-[11px] text-gray-400 px-1">
                    +{overflow} lainnya
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
