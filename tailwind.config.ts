import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0b1b2b",
          steel: "#2a3646",
          slate: "#3e4b5d",
          red: "#d1352d",
          yellow: "#f3b316",
          gray: "#c4c9cf",
          mist: "#eef2f6"
        }
      },
      fontFamily: {
        display: ["'Barlow Condensed'", "ui-sans-serif", "system-ui"],
        body: ["'Space Grotesk'", "ui-sans-serif", "system-ui"]
      },
      boxShadow: {
        soft: "0 20px 60px rgba(10, 20, 35, 0.18)",
        card: "0 18px 40px rgba(11, 27, 43, 0.14)"
      },
      backgroundImage: {
        "steel-grid": "linear-gradient(120deg, rgba(11,27,43,0.04), rgba(211,53,45,0.08)), repeating-linear-gradient(45deg, rgba(11,27,43,0.12), rgba(11,27,43,0.12) 1px, transparent 1px, transparent 8px)",
        "steel-radial": "radial-gradient(circle at 20% 20%, rgba(243,179,22,0.22), transparent 55%), radial-gradient(circle at 80% 10%, rgba(211,53,45,0.15), transparent 55%), radial-gradient(circle at 50% 80%, rgba(11,27,43,0.4), transparent 65%)"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.6s linear infinite",
        fadeUp: "fadeUp 0.6s ease-out"
      }
    }
  },
  plugins: []
};

export default config;
