"use client";

import { useTheme } from "@/components/ThemeProvider";
import { THEMES } from "@/lib/theme";
import { PALETTES } from "@/lib/colors";
import Modal from "@/components/ui/Modal";

export default function ThemeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { theme, setTheme } = useTheme();

  return (
    <Modal open={open} onClose={onClose} title="Tema Tampilan">
      <div className="space-y-2.5">
        {THEMES.map((t) => {
          const active = theme === t.id;
          const dots = PALETTES[t.id].slice(0, 5);
          return (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`w-full flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition ${
                active ? "border-brand ring-2 ring-brand/30" : "border-gray-200"
              }`}
              style={{ backgroundColor: t.previewBg }}
            >
              <span
                className="w-9 h-9 rounded-full flex-shrink-0 border border-black/5"
                style={{ backgroundColor: t.previewAccent }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-ink text-[15px]">{t.label}</p>
                <p className="text-xs text-gray-500">{t.description}</p>
                <div className="flex gap-1 mt-1.5">
                  {dots.map((c) => (
                    <span key={c.name} className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
                  ))}
                </div>
              </div>
              {active && <span className="text-brand text-lg flex-shrink-0">✓</span>}
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
