/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkviolet: '#4a0e8d',
        yellow: '#f1c40f',
        lightcoral: '#f08080',
        orange: '#f57c00',
        blue: '#3498db',
      },
    },
  },
  plugins: [],
}
