export type ThemeName = "default" | "pink" | "blue";

export interface ThemeMeta {
  id: ThemeName;
  label: string;
  description: string;
  previewBg: string; // swatch background in the picker
  previewAccent: string; // swatch accent dot in the picker
}

export const THEMES: ThemeMeta[] = [
  {
    id: "default",
    label: "Default",
    description: "Abu-abu lembut, warna kegiatan penuh warna",
    previewBg: "#f5f5f7",
    previewAccent: "#3b82f6",
  },
  {
    id: "pink",
    label: "Putih Pinky",
    description: "Putih bersih, aksen merah muda",
    previewBg: "#ffffff",
    previewAccent: "#ec4899",
  },
  {
    id: "blue",
    label: "Putih Biru",
    description: "Putih bersih, aksen biru",
    previewBg: "#ffffff",
    previewAccent: "#0ea5e9",
  },
];

export const DEFAULT_THEME: ThemeName = "default";
export const THEME_STORAGE_KEY = "kalender_theme_v1";
