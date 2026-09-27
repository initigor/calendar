"use client";

import { useEffect, useState } from "react";
import InstallInstructionsModal from "@/components/InstallInstructionsModal";
import { useInstall } from "@/components/InstallProvider";

const DISMISS_KEY = "kalender_install_dismissed_v1";

export default function InstallPrompt() {
  const { platform, isStandalone, canInstallNative, promptNativeInstall } = useInstall();
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(true); // start hidden until we know

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // localStorage unavailable (private mode) — dismissal just won't persist
    }
  }

  async function handleTapInstall() {
    if (canInstallNative) {
      await promptNativeInstall();
      dismiss();
    } else {
      setShowModal(true);
    }
  }

  const eligible = canInstallNative || platform === "ios" || platform === "mac-safari";
  if (isStandalone || dismissed || !eligible) return null;

  return (
    <>
      <div className="mx-3 mt-3 sm:mx-4 sm:mt-4 rounded-2xl bg-white shadow-card border border-gray-100 px-4 py-3 flex items-center gap-3 animate-fade-in">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-brand to-brand-dark flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ink truncate">Pasang Kalender di layar utama</p>
          <p className="text-xs text-gray-500 truncate">Akses lebih cepat, tampil seperti aplikasi asli</p>
        </div>
        <button
          onClick={handleTapInstall}
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

      <InstallInstructionsModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          dismiss();
        }}
      />
    </>
  );
}
