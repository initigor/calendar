import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas)",
        ink: "#1d1d1f",
        brand: {
          DEFAULT: "rgb(var(--brand) / <alpha-value>)",
          dark: "rgb(var(--brand-dark) / <alpha-value>)",
          tint: "rgb(var(--brand-tint) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        sheet: "0 -4px 24px rgba(0,0,0,0.08)",
        card: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
      },
      keyframes: {
        "slide-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "slide-up": "slide-up 0.25s ease-out",
        "fade-in": "fade-in 0.15s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
