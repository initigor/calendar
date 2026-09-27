"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { dateKey } from "@/lib/date-utils";
import Modal from "@/components/ui/Modal";
import type { CalendarEvent } from "@/lib/types";

export default function EventForm({
  open,
  onClose,
  defaultDate,
  editingEvent,
  environmentId,
  currentUserId,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  defaultDate: Date | null;
  editingEvent: CalendarEvent | null;
  environmentId: string;
  currentUserId: string;
  onSaved: () => void;
}) {
  const supabase = createClient();

  const [judul, setJudul] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [isAllDay, setIsAllDay] = useState(true);
  const [jamMulai, setJamMulai] = useState("09:00");
  const [jamSelesai, setJamSelesai] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [catatan, setCatatan] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (editingEvent) {
      setJudul(editingEvent.judul);
      setTanggal(editingEvent.tanggal);
      setIsAllDay(!editingEvent.jam_mulai);
      setJamMulai(editingEvent.jam_mulai?.slice(0, 5) ?? "09:00");
      setJamSelesai(editingEvent.jam_selesai?.slice(0, 5) ?? "");
      setLokasi(editingEvent.lokasi ?? "");
      setCatatan(editingEvent.catatan ?? "");
    } else {
      setJudul("");
      setTanggal(defaultDate ? dateKey(defaultDate) : dateKey(new Date()));
      setIsAllDay(true);
      setJamMulai("09:00");
      setJamSelesai("");
      setLokasi("");
      setCatatan("");
    }
    setError(null);
  }, [open, editingEvent, defaultDate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const payload = {
      environment_id: environmentId,
      owner_user_id: currentUserId,
      judul: judul.trim(),
      tanggal,
      jam_mulai: isAllDay ? null : jamMulai,
      jam_selesai: isAllDay || !jamSelesai ? null : jamSelesai,
      lokasi: lokasi.trim() || null,
      catatan: catatan.trim() || null,
    };

    try {
      if (editingEvent) {
        const { error } = await supabase.from("events").update(payload).eq("id", editingEvent.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("events").insert(payload);
        if (error) throw error;
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan kegiatan");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editingEvent ? "Edit Kegiatan" : "Kegiatan Baru"}>
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Judul</label>
          <input
            autoFocus
            required
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            placeholder="Misal: Meeting tim"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Tanggal</label>
          <input
            type="date"
            required
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition"
          />
        </div>

        <label className="flex items-center gap-2.5 py-1">
          <input
            type="checkbox"
            checked={isAllDay}
            onChange={(e) => setIsAllDay(e.target.checked)}
            className="w-4 h-4 rounded accent-brand"
          />
          <span className="text-sm text-ink">Sepanjang hari</span>
        </label>

        {!isAllDay && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Jam mulai</label>
              <input
                type="time"
                required={!isAllDay}
                value={jamMulai}
                onChange={(e) => setJamMulai(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Jam selesai <span className="text-gray-300">(opsional)</span>
              </label>
              <input
                type="time"
                value={jamSelesai}
                onChange={(e) => setJamSelesai(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Lokasi <span className="text-gray-300">(opsional)</span>
          </label>
          <input
            value={lokasi}
            onChange={(e) => setLokasi(e.target.value)}
            placeholder="Misal: Kantor, Rumah"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Catatan <span className="text-gray-300">(opsional)</span>
          </label>
          <textarea
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            rows={3}
            placeholder="Detail tambahan..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition resize-none"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-brand text-white font-medium py-2.5 text-[15px] active:bg-brand-dark disabled:opacity-50"
        >
          {busy ? "Menyimpan..." : "Simpan"}
        </button>
      </form>
    </Modal>
  );
}
