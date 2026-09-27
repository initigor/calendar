import type { ThemeName } from "@/lib/theme";

export interface MemberColor {
  name: string;
  bg: string; // tint background for pills/cells
  blockBg: string; // stronger tint for week/day timeline blocks
  border: string; // left border accent
  text: string; // title text color
  dot: string; // solid dot / badge background
  solidBg: string; // solid background (all-day chip, avatar)
}

// Full literal class names (not template strings) so Tailwind's content
// scanner can find and generate them at build time.
const COLOR_LIBRARY = {
  blue: {
    name: "blue",
    bg: "bg-blue-50",
    blockBg: "bg-blue-100",
    border: "border-blue-400",
    text: "text-blue-800",
    dot: "bg-blue-500",
    solidBg: "bg-blue-500",
  },
  green: {
    name: "green",
    bg: "bg-green-50",
    blockBg: "bg-green-100",
    border: "border-green-400",
    text: "text-green-800",
    dot: "bg-green-500",
    solidBg: "bg-green-500",
  },
  amber: {
    name: "amber",
    bg: "bg-amber-50",
    blockBg: "bg-amber-100",
    border: "border-amber-400",
    text: "text-amber-800",
    dot: "bg-amber-500",
    solidBg: "bg-amber-500",
  },
  pink: {
    name: "pink",
    bg: "bg-pink-50",
    blockBg: "bg-pink-100",
    border: "border-pink-400",
    text: "text-pink-800",
    dot: "bg-pink-500",
    solidBg: "bg-pink-500",
  },
  purple: {
    name: "purple",
    bg: "bg-purple-50",
    blockBg: "bg-purple-100",
    border: "border-purple-400",
    text: "text-purple-800",
    dot: "bg-purple-500",
    solidBg: "bg-purple-500",
  },
  orange: {
    name: "orange",
    bg: "bg-orange-50",
    blockBg: "bg-orange-100",
    border: "border-orange-400",
    text: "text-orange-800",
    dot: "bg-orange-500",
    solidBg: "bg-orange-500",
  },
  teal: {
    name: "teal",
    bg: "bg-teal-50",
    blockBg: "bg-teal-100",
    border: "border-teal-400",
    text: "text-teal-800",
    dot: "bg-teal-500",
    solidBg: "bg-teal-500",
  },
  red: {
    name: "red",
    bg: "bg-red-50",
    blockBg: "bg-red-100",
    border: "border-red-400",
    text: "text-red-800",
    dot: "bg-red-500",
    solidBg: "bg-red-500",
  },
  rose: {
    name: "rose",
    bg: "bg-rose-50",
    blockBg: "bg-rose-100",
    border: "border-rose-400",
    text: "text-rose-800",
    dot: "bg-rose-500",
    solidBg: "bg-rose-500",
  },
  fuchsia: {
    name: "fuchsia",
    bg: "bg-fuchsia-50",
    blockBg: "bg-fuchsia-100",
    border: "border-fuchsia-400",
    text: "text-fuchsia-800",
    dot: "bg-fuchsia-500",
    solidBg: "bg-fuchsia-500",
  },
  sky: {
    name: "sky",
    bg: "bg-sky-50",
    blockBg: "bg-sky-100",
    border: "border-sky-400",
    text: "text-sky-800",
    dot: "bg-sky-500",
    solidBg: "bg-sky-500",
  },
  cyan: {
    name: "cyan",
    bg: "bg-cyan-50",
    blockBg: "bg-cyan-100",
    border: "border-cyan-400",
    text: "text-cyan-800",
    dot: "bg-cyan-500",
    solidBg: "bg-cyan-500",
  },
  indigo: {
    name: "indigo",
    bg: "bg-indigo-50",
    blockBg: "bg-indigo-100",
    border: "border-indigo-400",
    text: "text-indigo-800",
    dot: "bg-indigo-500",
    solidBg: "bg-indigo-500",
  },
} satisfies Record<string, MemberColor>;

export const PALETTES: Record<ThemeName, MemberColor[]> = {
  // Full rainbow — maximizes contrast between members.
  default: [
    COLOR_LIBRARY.blue,
    COLOR_LIBRARY.green,
    COLOR_LIBRARY.amber,
    COLOR_LIBRARY.pink,
    COLOR_LIBRARY.purple,
    COLOR_LIBRARY.orange,
    COLOR_LIBRARY.teal,
    COLOR_LIBRARY.red,
  ],
  // Warm pink/rose family, tuned for the "Putih Pinky" white+pink theme.
  pink: [
    COLOR_LIBRARY.pink,
    COLOR_LIBRARY.rose,
    COLOR_LIBRARY.fuchsia,
    COLOR_LIBRARY.purple,
    COLOR_LIBRARY.red,
    COLOR_LIBRARY.orange,
  ],
  // Cool blue family, tuned for the "Putih Biru" white+blue theme.
  blue: [
    COLOR_LIBRARY.blue,
    COLOR_LIBRARY.sky,
    COLOR_LIBRARY.cyan,
    COLOR_LIBRARY.indigo,
    COLOR_LIBRARY.teal,
    COLOR_LIBRARY.purple,
  ],
};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Deterministic color per member/environment id within the given theme's
 * palette — stable across sessions/devices without needing to persist a
 * color column, since the same id always hashes the same.
 */
export function colorForUser(id: string, theme: ThemeName = "default"): MemberColor {
  const palette = PALETTES[theme];
  const idx = hashString(id) % palette.length;
  return palette[idx];
}
