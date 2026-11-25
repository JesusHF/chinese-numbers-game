/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        chinese: {
          red: '#dc2626',
          darkRed: '#991b1b',
          gold: '#f59e0b',
        }
      }
    },
  },
  plugins: [],
}
