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
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        mist: "rgb(var(--color-mist) / <alpha-value>)",
        glacier: "rgb(var(--color-glacier) / <alpha-value>)",
        moss: "rgb(var(--color-moss) / <alpha-value>)",
        sand: "rgb(var(--color-sand) / <alpha-value>)",
        fog: "rgb(var(--color-fog) / <alpha-value>)",
      },
      boxShadow: {
        panel: "0 20px 50px rgba(6, 28, 33, 0.12)",
      },
      backgroundImage: {
        "nordic-grid":
          "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
