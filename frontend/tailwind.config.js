/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        suse: ["Suse", "sans-serif"],
      },
      colors: {
        primary: "#25CF7A", // Color secundario para acentos
      },
    },
  },
  plugins: [],
};
