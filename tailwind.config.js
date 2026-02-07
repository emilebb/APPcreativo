/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        night: {
          bg: "#050707",
          card: "#0b0f0e",
          text: "rgba(255,255,255,0.86)",
          muted: "rgba(255,255,255,0.62)",
        },
      },
    },
  },
  plugins: [],
};
