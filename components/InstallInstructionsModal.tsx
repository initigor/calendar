"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { useInstall } from "@/components/InstallProvider";

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand text-white text-xs font-semibold flex items-center justify-center">
        {n}
      </span>
      <span className="text-[15px] text-ink">{children}</span>
    </li>
  );
}

export default function InstallInstructionsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { platform, isStandalone, canInstallNative, promptNativeInstall } = useInstall();
  const [installing, setInstalling] = useState(false);

  async function handleNativeInstall() {
    setInstalling(true);
    try {
      await promptNativeInstall();
    } finally {
      setInstalling(false);
      onClose();
    }
  }

  if (isStandalone) {
    return (
      <Modal open={open} onClose={onClose} title="Sudah Terpasang">
        <p className="text-[15px] text-ink">
          Aplikasi ini sudah kamu buka sebagai aplikasi terpasang di perangkat ini. 🎉
        </p>
        <button
          onClick={onClose}
          className="w-full mt-5 rounded-xl bg-gray-100 text-ink font-medium py-2.5 text-[15px] active:bg-gray-200"
        >
          Oke
        </button>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose} title="Pasang Aplikasi">
      {canInstallNative && (
        <div className="mb-5">
          <p className="text-sm text-gray-500 mb-3">
            Perangkatmu mendukung pemasangan satu klik.
          </p>
          <button
            onClick={handleNativeInstall}
            disabled={installing}
            className="w-full rounded-xl bg-brand text-white font-medium py-2.5 text-[15px] active:bg-brand-dark disabled:opacity-50"
          >
            {installing ? "Memasang..." : "Pasang Sekarang"}
          </button>
        </div>
      )}

      {!canInstallNative && platform === "android" && (
        <ol className="space-y-4">
          <Step n={1}>
            Ketuk menu <strong>⋮</strong> (tiga titik) di pojok kanan atas Chrome.
          </Step>
          <Step n={2}>
            Pilih <strong>&quot;Install app&quot;</strong> atau{" "}
            <strong>&quot;Add to Home screen&quot;</strong>.
          </Step>
          <Step n={3}>Ketuk &quot;Install&quot; untuk konfirmasi.</Step>
        </ol>
      )}

      {platform === "ios" && (
        <>
          <ol className="space-y-4">
            <Step n={1}>
              Ketuk tombol <strong>Share</strong>{" "}
              <span aria-hidden>⬆️</span> di bilah bawah Safari.
            </Step>
            <Step n={2}>
              Gulir lalu pilih <strong>&quot;Add to Home Screen&quot;</strong> (Tambah ke
              Layar Utama).
            </Step>
            <Step n={3}>
              Ketuk <strong>&quot;Add&quot;</strong> di pojok kanan atas.
            </Step>
          </ol>
          <p className="text-xs text-gray-400 mt-4">
            Catatan: hanya berlaku di Safari — browser lain di iOS belum mendukung install
            ke layar utama.
          </p>
        </>
      )}

      {platform === "mac-safari" && (
        <>
          <ol className="space-y-4">
            <Step n={1}>
              Klik menu <strong>File</strong> di menu bar, atau tombol{" "}
              <strong>Share</strong> <span aria-hidden>⬆️</span> di address bar Safari.
            </Step>
            <Step n={2}>
              Pilih <strong>&quot;Add to Dock&quot;</strong> (Tambahkan ke Dock).
            </Step>
            <Step n={3}>Klik &quot;Add&quot; untuk konfirmasi — ikon muncul di Dock.</Step>
          </ol>
          <p className="text-xs text-gray-400 mt-4">
            Butuh macOS Sonoma atau lebih baru. Versi macOS lebih lama belum mendukung fitur
            ini di Safari.
          </p>
        </>
      )}

      {!canInstallNative && platform === "other" && (
        <p className="text-[15px] text-ink">
          Browser ini belum mendukung pemasangan langsung. Coba buka halaman ini lewat{" "}
          <strong>Chrome</strong> (Android/desktop) atau <strong>Safari</strong>{" "}
          (iPhone/iPad/Mac) untuk memasangnya ke layar utama atau Dock.
        </p>
      )}

      <button
        onClick={onClose}
        className="w-full mt-5 rounded-xl bg-gray-100 text-ink font-medium py-2.5 text-[15px] active:bg-gray-200"
      >
        Mengerti
      </button>
    </Modal>
  );
}
