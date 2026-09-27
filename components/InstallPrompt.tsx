"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "kalender_install_dismissed_v1";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [dismissed, setDismissed] = useState(true); // start hidden until we know

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) {
      setDismissed(true);
      return;
    }

    const ua = window.navigator.userAgent;
    const iosDevice = /iPhone|iPad|iPod/.test(ua) && !("MSStream" in window);
    setIsIos(iosDevice);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // localStorage unavailable (private mode) — dismissal just won't persist
    }
  }

  async function handleAndroidInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    dismiss();
  }

  if (dismissed || (!deferredPrompt && !isIos)) return null;

  return (
    <>
      <div className="mx-3 mt-3 sm:mx-4 sm:mt-4 rounded-2xl bg-white shadow-card border border-gray-100 px-4 py-3 flex items-center gap-3 animate-fade-in">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-brand to-brand-dark flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ink truncate">Pasang Kalender di layar utama</p>
          <p className="text-xs text-gray-500 truncate">Akses lebih cepat, tampil seperti aplikasi asli</p>
        </div>
        <button
          onClick={() => (deferredPrompt ? handleAndroidInstall() : setShowIosModal(true))}
          className="flex-shrink-0 rounded-full bg-brand text-white text-sm font-medium px-3.5 py-1.5 active:bg-brand-dark"
        >
          Pasang
        </button>
        <button
          onClick={dismiss}
          aria-label="Tutup"
          className="flex-shrink-0 text-gray-400 text-lg leading-none px-1"
        >
          ✕
        </button>
      </div>

      <Modal open={showIosModal} onClose={() => setShowIosModal(false)} title="Pasang di iPhone/iPad">
        <ol className="space-y-4 text-[15px] text-ink">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand text-white text-xs font-semibold flex items-center justify-center">
              1
            </span>
            <span>
              Ketuk tombol <strong>Share</strong>{" "}
              <span aria-hidden className="inline-block align-middle">
                ⬆️
              </span>{" "}
              di bilah bawah Safari.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand text-white text-xs font-semibold flex items-center justify-center">
              2
            </span>
            <span>
              Gulir lalu pilih <strong>&quot;Add to Home Screen&quot;</strong> (Tambah ke Layar Utama).
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand text-white text-xs font-semibold flex items-center justify-center">
              3
            </span>
            <span>
              Ketuk <strong>&quot;Add&quot;</strong> (Tambah) di pojok kanan atas — ikon Kalender akan muncul di layar utama.
            </span>
          </li>
        </ol>
        <p className="text-xs text-gray-400 mt-4">
          Catatan: instruksi ini hanya berlaku di Safari. Browser lain di iOS (Chrome, dsb.) belum mendukung install ke layar utama.
        </p>
        <button
          onClick={() => {
            setShowIosModal(false);
            dismiss();
          }}
          className="w-full mt-5 rounded-xl bg-gray-100 text-ink font-medium py-2.5 text-[15px] active:bg-gray-200"
        >
          Mengerti
        </button>
      </Modal>
    </>
  );
}
