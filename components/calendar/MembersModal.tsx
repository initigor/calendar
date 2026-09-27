"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { colorForUser } from "@/lib/colors";
import { useTheme } from "@/components/ThemeProvider";
import Modal from "@/components/ui/Modal";
import ThemeModal from "@/components/ThemeModal";
import InstallInstructionsModal from "@/components/InstallInstructionsModal";
import type { EnvironmentMember } from "@/lib/types";

export default function MembersModal({
  open,
  onClose,
  environment,
  members,
  currentUserId,
}: {
  open: boolean;
  onClose: () => void;
  environment: { id: string; nama: string; owner_id: string; invite_code: string };
  members: EnvironmentMember[];
  currentUserId: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const { theme } = useTheme();

  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const [showInstall, setShowInstall] = useState(false);

  const isOwner = environment.owner_id === currentUserId;

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(environment.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — user can still select the code manually
    }
  }

  async function handleAddByUsername(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { error } = await supabase.rpc("add_member_by_username", {
        p_environment_id: environment.id,
        p_username: username.trim(),
      });
      if (error) throw error;
      setUsername("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menambah anggota");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemoveMember(userId: string) {
    if (!confirm("Keluarkan anggota ini dari environment?")) return;
    setBusy(true);
    try {
      await supabase
        .from("environment_members")
        .delete()
        .eq("environment_id", environment.id)
        .eq("user_id", userId);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleLeave() {
    if (!confirm("Keluar dari environment ini?")) return;
    setBusy(true);
    try {
      await supabase
        .from("environment_members")
        .delete()
        .eq("environment_id", environment.id)
        .eq("user_id", currentUserId);
      router.push("/environments");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteEnvironment() {
    if (!confirm(`Hapus environment "${environment.nama}"? Semua kegiatan di dalamnya akan ikut terhapus.`))
      return;
    setBusy(true);
    try {
      const { error } = await supabase.from("environments").delete().eq("id", environment.id);
      if (error) throw error;
      router.push("/environments");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus environment");
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={environment.nama}>
      <div className="mb-5">
        <p className="text-xs font-medium text-gray-500 mb-1.5">Kode undangan</p>
        <button
          onClick={copyCode}
          className="w-full flex items-center justify-between rounded-xl border border-dashed border-gray-300 bg-gray-50 px-3.5 py-2.5"
        >
          <span className="font-mono text-lg tracking-[0.3em] text-ink">{environment.invite_code}</span>
          <span className="text-xs text-brand font-medium">{copied ? "Tersalin!" : "Salin"}</span>
        </button>
      </div>

      <div className="mb-5 space-y-2">
        <p className="text-xs font-medium text-gray-500 mb-1.5">Tampilan & Aplikasi</p>
        <button
          onClick={() => setShowTheme(true)}
          className="w-full flex items-center gap-2.5 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5"
        >
          <span className="text-base">🎨</span>
          <span className="flex-1 text-left text-sm text-ink">Ganti tema</span>
          <span className="text-gray-300">›</span>
        </button>
        <button
          onClick={() => setShowInstall(true)}
          className="w-full flex items-center gap-2.5 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5"
        >
          <span className="text-base">📲</span>
          <span className="flex-1 text-left text-sm text-ink">Pasang aplikasi</span>
          <span className="text-gray-300">›</span>
        </button>
      </div>

      <div className="mb-5">
        <p className="text-xs font-medium text-gray-500 mb-2">
          Anggota ({members.length})
        </p>
        <ul className="space-y-1.5">
          {members.map((m) => {
            const color = colorForUser(m.user_id, theme);
            return (
              <li
                key={m.user_id}
                className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 bg-gray-50"
              >
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color.dot}`} />
                <span className="flex-1 min-w-0 text-sm text-ink truncate">
                  {m.profiles?.username ?? "Anggota"}
                  {m.user_id === currentUserId && (
                    <span className="text-gray-400"> (kamu)</span>
                  )}
                </span>
                <span className="text-[11px] text-gray-400 flex-shrink-0">
                  {m.role === "owner" ? "Pemilik" : "Anggota"}
                </span>
                {isOwner && m.user_id !== currentUserId && (
                  <button
                    onClick={() => handleRemoveMember(m.user_id)}
                    disabled={busy}
                    className="text-xs text-red-500 flex-shrink-0 px-1"
                  >
                    Keluarkan
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <form onSubmit={handleAddByUsername} className="mb-5">
        <label className="block text-xs font-medium text-gray-500 mb-1.5">
          Tambah anggota via username
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            required
            autoCapitalize="none"
            autoCorrect="off"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username teman"
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-brand text-white font-medium px-4 text-sm disabled:opacity-50"
          >
            Tambah
          </button>
        </div>
        <p className="text-[11px] text-gray-400 mt-1.5">
          Orang tersebut harus sudah pernah mendaftar di aplikasi ini.
        </p>
      </form>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      {isOwner ? (
        <button
          onClick={handleDeleteEnvironment}
          disabled={busy}
          className="w-full rounded-xl bg-red-50 text-red-600 font-medium py-2.5 text-[15px] active:bg-red-100 disabled:opacity-50"
        >
          Hapus Environment
        </button>
      ) : (
        <button
          onClick={handleLeave}
          disabled={busy}
          className="w-full rounded-xl bg-red-50 text-red-600 font-medium py-2.5 text-[15px] active:bg-red-100 disabled:opacity-50"
        >
          Keluar dari Environment
        </button>
      )}

      <ThemeModal open={showTheme} onClose={() => setShowTheme(false)} />
      <InstallInstructionsModal open={showInstall} onClose={() => setShowInstall(false)} />
    </Modal>
  );
}
