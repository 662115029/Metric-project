/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors from your design
        'dark-red': '#250101',
        'medium-red': '#281616',
        'dark-gray': '#2C2C2C',
        'light-gray': '#333',
      },
      backgroundImage: {
        'game-gradient': 'linear-gradient(to right, #2C2C2C 0%, #281616 100%, #250101 100%)',
        'category-gradient': 'linear-gradient(to bottom, #2C2C2C 0%, #281616 100%, #250101 100%)',
      },
    },
  },
  plugins: [],
}