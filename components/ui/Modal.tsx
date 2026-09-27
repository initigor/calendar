"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 animate-fade-in"
        onClick={onClose}
      />
      <div
        className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-sheet sm:shadow-card p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:pb-5 max-h-[88dvh] overflow-y-auto animate-slide-up sm:animate-fade-in"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center active:bg-gray-200"
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
