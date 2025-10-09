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
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        }
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
      },
    },
  },typography: {
      DEFAULT: {
        css: {
          color: '#374151',
          a: {
            color: '#0A2342', // Your primary color
            '&:hover': {
              color: '#1a3b6e', // Your primary-light color
            },
          },
          h2: {
            color: '#0A2342',
          },
          h3: {
            color: '#0A2342',
          },
          strong: {
            color: '#0A2342',
          },
        },
      },
    },
 
  plugins: [
    require('@tailwindcss/typography'),
  ],
}