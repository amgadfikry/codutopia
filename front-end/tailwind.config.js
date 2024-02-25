/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'darker-blue': '#09005D',
        'dark-blue': '#1B0E91',
        'light-blue': '#92B3FA',
        'bg-blue': '#E2E7FD',
        'dark-purple': '#4548ED',
        'light-purple': '#7D97F4',
        'light-red': '#FE786D',
        'light-gray': '#F5F7F8',
        'dark-gray': '#E4E7EB',
        'darker-gray': '#9CA3AF',
        'light-black': '#1F2937',
      }
    },
  },
  plugins: [],
}

