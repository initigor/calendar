"use client";

import { useEffect, useRef } from "react";
import { DAY_LABELS, HOURS, dateKey, isToday } from "@/lib/date-utils";
import { colorForUser } from "@/lib/colors";
import { useTheme } from "@/components/ThemeProvider";
import type { CalendarEvent } from "@/lib/types";

const HOUR_HEIGHT = 56; // px

function timeToMinutes(t: string | null): number | null {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export default function WeekView({
  days,
  eventsByDate,
  onSelectDay,
  onSelectEvent,
}: {
  days: Date[];
  eventsByDate: Record<string, CalendarEvent[]>;
  onSelectDay: (date: Date) => void;
  onSelectEvent: (event: CalendarEvent) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 6 * HOUR_HEIGHT; // mulai dari sekitar jam 06.00
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100dvh-172px)] sm:h-[calc(100dvh-180px)]">
      <div
        className="grid border-b border-gray-200 px-2 sm:px-6"
        style={{ gridTemplateColumns: `44px repeat(${days.length}, 1fr)` }}
      >
        <div />
        {days.map((day) => {
          const today = isToday(day);
          return (
            <button
              key={dateKey(day)}
              onClick={() => onSelectDay(day)}
              className="flex flex-col items-center py-1.5"
            >
              <span className="text-[10px] sm:text-xs text-gray-400">
                {DAY_LABELS[(day.getDay() + 6) % 7]}
              </span>
              <span
                className={`inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full text-sm font-medium mt-0.5 ${
                  today ? "bg-red-500 text-white" : "text-ink"
                }`}
              >
                {day.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      {/* all-day row */}
      <div
        className="grid border-b border-gray-200 px-2 sm:px-6 py-1 gap-1 min-h-[28px]"
        style={{ gridTemplateColumns: `44px repeat(${days.length}, 1fr)` }}
      >
        <div />
        {days.map((day) => {
          const allDay = (eventsByDate[dateKey(day)] ?? []).filter((e) => !e.jam_mulai);
          return (
            <div key={dateKey(day)} className="flex flex-col gap-0.5">
              {allDay.map((ev) => {
                const color = colorForUser(ev.owner_user_id, theme);
                return (
                  <button
                    key={ev.id}
                    onClick={() => onSelectEvent(ev)}
                    className={`text-[9px] sm:text-[11px] truncate rounded px-1 py-[1px] ${color.blockBg} ${color.text}`}
                  >
                    {ev.judul}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-2 sm:px-6">
        <div
          className="grid relative"
          style={{ gridTemplateColumns: `44px repeat(${days.length}, 1fr)` }}
        >
          <div>
            {HOURS.map((h) => (
              <div
                key={h}
                style={{ height: HOUR_HEIGHT }}
                className="text-right pr-1.5 -translate-y-2"
              >
                <span className="text-[10px] text-gray-400">
                  {String(h).padStart(2, "0")}.00
                </span>
              </div>
            ))}
          </div>

          {days.map((day) => {
            const timed = (eventsByDate[dateKey(day)] ?? []).filter((e) => e.jam_mulai);
            return (
              <div
                key={dateKey(day)}
                className="relative border-l border-gray-100"
                style={{ height: HOUR_HEIGHT * 24 }}
              >
                {HOURS.map((h) => (
                  <div
                    key={h}
                    style={{ height: HOUR_HEIGHT }}
                    className="border-b border-gray-100"
                  />
                ))}

                {timed.map((ev) => {
                  const start = timeToMinutes(ev.jam_mulai) ?? 0;
                  const end = ev.jam_selesai ? timeToMinutes(ev.jam_selesai) ?? start + 45 : start + 45;
                  const top = (start / 60) * HOUR_HEIGHT;
                  const height = Math.max(((end - start) / 60) * HOUR_HEIGHT, 22);
                  const color = colorForUser(ev.owner_user_id, theme);
                  return (
                    <button
                      key={ev.id}
                      onClick={() => onSelectEvent(ev)}
                      style={{ top, height }}
                      className={`absolute left-0.5 right-0.5 rounded-md px-1 py-0.5 text-left overflow-hidden border-l-2 ${color.blockBg} ${color.border} ${color.text}`}
                    >
                      <p className="text-[9px] sm:text-[11px] font-medium leading-tight truncate">
                        {ev.judul}
                      </p>
                      {height > 30 && (
                        <p className="text-[8px] sm:text-[10px] opacity-80 truncate">
                          {ev.jam_mulai?.slice(0, 5)}
                          {ev.jam_selesai ? ` – ${ev.jam_selesai.slice(0, 5)}` : ""}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
