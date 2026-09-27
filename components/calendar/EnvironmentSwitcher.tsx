"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { colorForUser } from "@/lib/colors";
import { useTheme } from "@/components/ThemeProvider";

export default function EnvironmentSwitcher({
  currentId,
  currentName,
  options,
}: {
  currentId: string;
  currentName: string;
  options: { id: string; nama: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 max-w-[42vw] sm:max-w-none px-1"
      >
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${colorForUser(currentId, theme).dot}`} />
        <span className="font-semibold text-ink truncate">{currentName}</span>
        <span className="text-gray-400 text-xs">▾</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-card border border-gray-100 py-1.5 z-30 animate-fade-in">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                setOpen(false);
                if (opt.id !== currentId) router.push(`/environments/${opt.id}`);
              }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-sm active:bg-gray-50 ${
                opt.id === currentId ? "font-semibold text-ink" : "text-gray-600"
              }`}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colorForUser(opt.id, theme).dot}`} />
              <span className="truncate">{opt.nama}</span>
            </button>
          ))}
          <div className="my-1.5 border-t border-gray-100" />
          <button
            onClick={() => router.push("/environments")}
            className="w-full text-left px-3.5 py-2 text-sm text-brand font-medium active:bg-gray-50"
          >
            Kelola environment
          </button>
        </div>
      )}
    </div>
  );
}
