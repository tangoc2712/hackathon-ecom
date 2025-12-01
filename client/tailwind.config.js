/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#ED1C24", // Uniqlo Red
        secondary: "#333333", // Dark Gray/Black
        tertiary: "#F4F4F4", // Light Gray Background
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Clean sans-serif
      }
    },
  },
  plugins: [],
}
