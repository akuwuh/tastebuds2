import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      colors: {
        "taste-coral": {
          100: "#ffe0d6",
          300: "#ffb29d",
          500: "#ff6b4a",
          600: "#f24a2f",
          700: "#c5341f",
        },
        "taste-sunset": {
          100: "#ffe7d0",
          300: "#ffc28c",
          500: "#ff8434",
          600: "#ef6216",
          700: "#be4510",
        },
        "taste-rose": {
          100: "#ffd9e0",
          300: "#ffa4b5",
          500: "#ff6b88",
          600: "#e74a6a",
          700: "#b6324b",
        },
      },
      backgroundImage: {
        "orb-gradient":
          "radial-gradient(circle at 20% 20%, rgba(255, 132, 52, 0.35), transparent 40%), radial-gradient(circle at 80% 30%, rgba(255, 107, 136, 0.35), transparent 50%), radial-gradient(circle at 55% 70%, rgba(242, 74, 47, 0.25), transparent 60%)",
      },
      animation: {
        "slow-pulse": "slow-pulse 8s ease-in-out infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "slide-up": "slide-up 0.6s ease-out",
        shimmer: "shimmer 1.6s linear infinite",
      },
      keyframes: {
        "slow-pulse": {
          "0%, 100%": { transform: "scale(0.98) translateY(0px)", opacity: "0.9" },
          "50%": { transform: "scale(1.02) translateY(-8px)", opacity: "1" },
        },
        "float-slow": {
          "0%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -10px, 0)" },
          "100%": { transform: "translate3d(0, 0, 0)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(30px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        shimmer: {
          "0%": { "background-position": "-250px 0" },
          "100%": { "background-position": "250px 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

