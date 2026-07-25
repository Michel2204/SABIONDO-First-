import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        omnibus: {
          DEFAULT: "#0d4d3c",
          dark: "#0a3a2d",
          darker: "#082e24",
        },
        crema: "#f2e6c9",
        dorado: {
          DEFAULT: "#d9a441",
          claro: "#f0c664",
          oscuro: "#a9791f",
        },
        tinta: "#140f0c",
        linea: {
          rojo: "#b5342a",
          azul: "#2b5f8a",
          amarillo: "#d9a441",
          violeta: "#6b3f6e",
          naranja: "#c1652f",
          verde: "#3d7a52",
        },
      },
      fontFamily: {
        display: ["var(--font-bebas)", "sans-serif"],
        script: ["var(--font-kaushan)", "cursive"],
        heading: ["var(--font-fjalla)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      backgroundImage: {
        "grain": "radial-gradient(circle at 20% 20%, rgba(217,164,65,0.08), transparent 40%), radial-gradient(circle at 80% 80%, rgba(217,164,65,0.08), transparent 40%)",
        "chrome": "linear-gradient(180deg, #f0c664 0%, #d9a441 45%, #a9791f 100%)",
      },
      boxShadow: {
        "chapa": "0 4px 0 rgba(0,0,0,0.35), 0 10px 24px rgba(0,0,0,0.45)",
        "console": "0 0 0 6px #0a3a2d, 0 0 0 9px #f0c664, 0 30px 80px rgba(0,0,0,0.6)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        shimmer: "shimmer 3s linear infinite",
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
