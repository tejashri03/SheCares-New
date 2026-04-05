/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pink-50': '#fdf2f8',
        'pink-100': '#fce7f3',
        'pink-200': '#fbcfe8',
        'pink-300': '#f9a8d4',
        'pink-400': '#f472b6',
        'pink-500': '#ec4899',
        'pink-600': '#db2777',
        'pink-700': '#be185d',
        'pink-800': '#9d174d',
        'pink-900': '#831843',
        'rose-50': '#fff1f2',
        'rose-100': '#ffe4e6',
        'rose-200': '#fecdd3',
        'rose-300': '#fda4af',
        'rose-400': '#fb7185',
        'rose-500': '#f43f5e',
        'rose-600': '#e11d48',
        'rose-700': '#be123c',
        'rose-800': '#9f1239',
        'rose-900': '#881337',
      },
      backgroundImage: {
        'gradient-pink': 'linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #f9a8d4 100%)',
        'gradient-rose': 'linear-gradient(135deg, #f43f5e 0%, #fb7185 50%, #fda4af 100%)',
        'gradient-light': 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
