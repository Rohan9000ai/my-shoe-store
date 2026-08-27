import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        beige: "#F5E6D3",
        brown: "#6B4226",
        espresso: "#3E2723",
        gold: "#C9A227",
      },
      fontFamily: {
        heading: ["var(--font-playfair)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      backgroundImage: {
        "luxe-gradient": "linear-gradient(135deg, #F5E6D3 0%, #6B4226 100%)",
      },
    },
  },
  plugins: [],
};

export default config;