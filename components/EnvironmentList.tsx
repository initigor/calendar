"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { colorForUser } from "@/lib/colors";
import { useTheme } from "@/components/ThemeProvider";
import Modal from "@/components/ui/Modal";
import ThemeModal from "@/components/ThemeModal";
import InstallPrompt from "@/components/InstallPrompt";
import type { EnvironmentSummary } from "@/app/environments/page";

export default function EnvironmentList({
  environments,
  userName,
}: {
  environments: EnvironmentSummary[];
  userName: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const { theme } = useTheme();

  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const [nama, setNama] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesi berakhir, silakan masuk ulang");

      const { data, error } = await supabase
        .from("environments")
        .insert({ nama, owner_id: user.id })
        .select("id")
        .single();
      if (error) throw error;

      setShowCreate(false);
      setNama("");
      router.push(`/environments/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat environment");
    } finally {
      setBusy(false);
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc("join_environment_by_code", {
        p_invite_code: code.trim(),
      });
      if (error) throw error;

      setShowJoin(false);
      setCode("");
      router.push(`/environments/${data}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal bergabung");
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-dvh safe-top safe-bottom">
      <InstallPrompt />

      <header className="px-4 sm:px-6 pt-6 pb-4 flex items-center justify-between max-w-2xl mx-auto">
        <div>
          <p className="text-sm text-gray-500">Halo,</p>
          <h1 className="text-2xl font-semibold text-ink">{userName}</h1>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowTheme(true)}
            aria-label="Tema tampilan"
            className="w-9 h-9 rounded-full bg-white shadow-card flex items-center justify-center active:bg-gray-50"
          >
            <span className="text-[15px]">🎨</span>
          </button>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 font-medium px-3 py-1.5 rounded-lg active:bg-red-50"
          >
            Keluar
          </button>
        </div>
      </header>

      <main className="px-4 sm:px-6 max-w-2xl mx-auto pb-28">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
          Environment saya
        </h2>

        {environments.length === 0 ? (
          <div className="rounded-2xl bg-white shadow-card p-6 text-center">
            <p className="text-ink font-medium mb-1">Belum ada environment</p>
            <p className="text-sm text-gray-500">
              Buat environment baru atau gabung pakai kode undangan dari temanmu.
            </p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {environments.map((env) => {
              const color = colorForUser(env.id, theme);
              return (
                <li key={env.id}>
                  <button
                    onClick={() => router.push(`/environments/${env.id}`)}
                    className="w-full flex items-center gap-3.5 bg-white rounded-2xl shadow-card px-4 py-3.5 text-left active:scale-[0.99] transition"
                  >
                    <span className={`w-3 h-3 rounded-full flex-shrink-0 ${color.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-ink truncate">{env.nama}</p>
                      <p className="text-xs text-gray-500">
                        {env.memberCount} anggota ·{" "}
                        {env.role === "owner" ? "Pemilik" : "Anggota"}
                      </p>
                    </div>
                    <span className="text-gray-300 text-lg">›</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <div className="fixed bottom-0 inset-x-0 px-4 sm:px-6 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 bg-gradient-to-t from-canvas via-canvas to-transparent">
        <div className="max-w-2xl mx-auto flex gap-2.5">
          <button
            onClick={() => setShowJoin(true)}
            className="flex-1 rounded-xl bg-white border border-gray-200 text-ink font-medium py-3 text-[15px] shadow-card active:bg-gray-50"
          >
            Gabung dengan kode
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex-1 rounded-xl bg-brand text-white font-medium py-3 text-[15px] active:bg-brand-dark"
          >
            + Buat baru
          </button>
        </div>
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Buat Environment">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Nama environment
            </label>
            <input
              autoFocus
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Misal: Keluarga, Kos Bareng"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-brand text-white font-medium py-2.5 text-[15px] active:bg-brand-dark disabled:opacity-50"
          >
            {busy ? "Membuat..." : "Buat"}
          </button>
        </form>
      </Modal>

      <Modal open={showJoin} onClose={() => setShowJoin(false)} title="Gabung dengan Kode">
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Kode undangan (6 karakter)
            </label>
            <input
              autoFocus
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[15px] tracking-[0.3em] text-center font-mono uppercase focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-brand text-white font-medium py-2.5 text-[15px] active:bg-brand-dark disabled:opacity-50"
          >
            {busy ? "Bergabung..." : "Gabung"}
          </button>
        </form>
      </Modal>

      <ThemeModal open={showTheme} onClose={() => setShowTheme(false)} />
    </div>
  );
}
