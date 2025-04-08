/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#1f2937", // bg-gray-800
        secondary: "#e5e7eb", // bg-gray-200
        primaryYellow: "#fef08a", // bg-yellow-200
      },
    },
  },
  plugins: [],
};
