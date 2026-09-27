"use client";

import { format } from "@/lib/date-utils";
import { colorForUser } from "@/lib/colors";
import { useTheme } from "@/components/ThemeProvider";
import Modal from "@/components/ui/Modal";
import type { CalendarEvent } from "@/lib/types";

export default function DayEventsSheet({
  date,
  events,
  memberNames,
  currentUserId,
  onClose,
  onAdd,
  onEdit,
  onDelete,
}: {
  date: Date | null;
  events: CalendarEvent[];
  memberNames: Record<string, string>;
  currentUserId: string;
  onClose: () => void;
  onAdd: () => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (event: CalendarEvent) => void;
}) {
  const { theme } = useTheme();

  if (!date) return null;

  const sorted = [...events].sort((a, b) => {
    if (!a.jam_mulai) return -1;
    if (!b.jam_mulai) return 1;
    return a.jam_mulai.localeCompare(b.jam_mulai);
  });

  return (
    <Modal open={!!date} onClose={onClose} title={format(date, "EEEE, d MMMM yyyy")}>
      <div className="space-y-2 mb-4">
        {sorted.length === 0 && (
          <p className="text-sm text-gray-400 py-4 text-center">Belum ada kegiatan di hari ini.</p>
        )}
        {sorted.map((ev) => {
          const color = colorForUser(ev.owner_user_id, theme);
          const isMine = ev.owner_user_id === currentUserId;
          return (
            <div
              key={ev.id}
              className={`rounded-xl px-3 py-2.5 border-l-4 ${color.bg} ${color.border}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className={`font-medium text-[15px] truncate ${color.text}`}>{ev.judul}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {ev.jam_mulai
                      ? `${ev.jam_mulai.slice(0, 5)}${
                          ev.jam_selesai ? ` – ${ev.jam_selesai.slice(0, 5)}` : ""
                        }`
                      : "Sepanjang hari"}
                    {ev.lokasi ? ` · ${ev.lokasi}` : ""}
                  </p>
                  {ev.catatan && (
                    <p className="text-xs text-gray-500 mt-1 whitespace-pre-wrap">{ev.catatan}</p>
                  )}
                  <p className="text-[11px] text-gray-400 mt-1">
                    {memberNames[ev.owner_user_id] ?? "Anggota"}
                  </p>
                </div>
                {isMine && (
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => onEdit(ev)}
                      className="w-7 h-7 rounded-full bg-white/70 flex items-center justify-center text-xs active:bg-white"
                      aria-label="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onDelete(ev)}
                      className="w-7 h-7 rounded-full bg-white/70 flex items-center justify-center text-xs active:bg-white"
                      aria-label="Hapus"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onAdd}
        className="w-full rounded-xl bg-brand text-white font-medium py-2.5 text-[15px] active:bg-brand-dark"
      >
        + Tambah kegiatan
      </button>
    </Modal>
  );
}
