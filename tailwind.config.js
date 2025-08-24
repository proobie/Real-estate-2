/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          'DEFAULT': '#0A2342', // Dark Navy Blue
          'light': '#1a3b6e',
          'dark': '#051424',
        },
        'secondary': {
          'DEFAULT': '#D4AF37', // Gold
          'light': '#e6c66a',
          'dark': '#b38f29',
        },
      },
    },
  },
  plugins: [],
}