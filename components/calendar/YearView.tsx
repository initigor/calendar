"use client";

import { MONTH_LABELS, dateKey, getMonthGrid, isSameMonth, isToday } from "@/lib/date-utils";
import type { CalendarEvent } from "@/lib/types";

export default function YearView({
  anchor,
  eventsByDate,
  onSelectMonth,
}: {
  anchor: Date;
  eventsByDate: Record<string, CalendarEvent[]>;
  onSelectMonth: (monthIndex: number) => void;
}) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-10 grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
      {MONTH_LABELS.map((label, idx) => {
        const monthAnchor = new Date(anchor.getFullYear(), idx, 1);
        const days = getMonthGrid(monthAnchor);
        return (
          <button
            key={label}
            onClick={() => onSelectMonth(idx)}
            className="bg-white rounded-2xl shadow-card p-2.5 text-left"
          >
            <p className="text-xs font-semibold text-ink mb-1.5 px-0.5">{label}</p>
            <div className="grid grid-cols-7 gap-y-0.5">
              {days.map((day) => {
                const inMonth = isSameMonth(day, monthAnchor);
                const today = isToday(day);
                const hasEvents = (eventsByDate[dateKey(day)] ?? []).length > 0;
                return (
                  <div key={dateKey(day)} className="flex flex-col items-center">
                    <span
                      className={`text-[8px] sm:text-[9px] w-4 h-4 flex items-center justify-center rounded-full ${
                        today
                          ? "bg-red-500 text-white"
                          : inMonth
                          ? "text-gray-600"
                          : "text-gray-300"
                      }`}
                    >
                      {day.getDate()}
                    </span>
                    <span
                      className={`w-1 h-1 rounded-full mt-[1px] ${
                        hasEvents && inMonth ? "bg-brand" : "bg-transparent"
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </button>
        );
      })}
    </div>
  );
}
