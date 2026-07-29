import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0A0E17",
          900: "#0F1420",
          800: "#161D2E",
          700: "#212A3F",
          600: "#2E3950",
        },
        accent: {
          400: "#6C8CFF",
          500: "#4F6BF0",
          600: "#3E52D6",
        },
        surface: {
          DEFAULT: "#0F1420",
          raised: "#161D2E",
          border: "#232C42",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.4), 0 8px 24px -8px rgba(0,0,0,0.5)",
      },
    },
  },
  plugins: [],
};
export default config;
