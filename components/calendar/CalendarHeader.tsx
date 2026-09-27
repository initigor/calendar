"use client";

import { MONTH_LABELS, format } from "@/lib/date-utils";
import EnvironmentSwitcher from "@/components/calendar/EnvironmentSwitcher";
import type { ViewMode } from "@/components/calendar/CalendarApp";

const VIEWS: { key: ViewMode; label: string }[] = [
  { key: "day", label: "Hari" },
  { key: "week", label: "Minggu" },
  { key: "month", label: "Bulan" },
  { key: "year", label: "Tahun" },
];

export default function CalendarHeader({
  environmentId,
  environmentName,
  environmentOptions,
  viewMode,
  onChangeView,
  anchor,
  onPrev,
  onNext,
  onToday,
  onOpenMembers,
}: {
  environmentId: string;
  environmentName: string;
  environmentOptions: { id: string; nama: string }[];
  viewMode: ViewMode;
  onChangeView: (v: ViewMode) => void;
  anchor: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onOpenMembers: () => void;
}) {
  const titleLabel =
    viewMode === "year"
      ? format(anchor, "yyyy")
      : `${MONTH_LABELS[anchor.getMonth()]} ${anchor.getFullYear()}`;

  return (
    <div className="sticky top-0 z-20 bg-canvas/90 backdrop-blur-md px-4 sm:px-6 pt-3 safe-top">
      <div className="flex items-center justify-between gap-2 mb-2.5 sm:mb-3 max-w-4xl mx-auto">
        <EnvironmentSwitcher
          currentId={environmentId}
          currentName={environmentName}
          options={environmentOptions}
        />

        <div className="hidden sm:flex items-center bg-gray-200/70 rounded-full p-0.5 text-[13px] font-medium">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              onClick={() => onChangeView(v.key)}
              className={`px-3.5 py-1 rounded-full transition ${
                viewMode === v.key
                  ? "bg-white text-ink shadow-sm"
                  : "text-gray-500"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        <button
          onClick={onOpenMembers}
          aria-label="Anggota & pengaturan"
          className="w-9 h-9 rounded-full bg-white shadow-card flex items-center justify-center flex-shrink-0 active:bg-gray-50"
        >
          <span className="text-[15px]">⚙️</span>
        </button>
      </div>

      <div className="flex sm:hidden items-center bg-gray-200/70 rounded-full p-0.5 text-[12px] font-medium mb-2.5 max-w-4xl mx-auto">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            onClick={() => onChangeView(v.key)}
            className={`flex-1 py-1.5 rounded-full transition ${
              viewMode === v.key ? "bg-white text-ink shadow-sm" : "text-gray-500"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between max-w-4xl mx-auto pb-3">
        <h1 className="text-xl sm:text-2xl font-semibold text-ink">{titleLabel}</h1>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToday}
            className="text-sm font-medium text-brand px-2.5 py-1 rounded-lg active:bg-brand-tint"
          >
            Hari ini
          </button>
          <button
            onClick={onPrev}
            aria-label="Sebelumnya"
            className="w-8 h-8 rounded-full bg-white shadow-card flex items-center justify-center active:bg-gray-50"
          >
            ‹
          </button>
          <button
            onClick={onNext}
            aria-label="Berikutnya"
            className="w-8 h-8 rounded-full bg-white shadow-card flex items-center justify-center active:bg-gray-50"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
