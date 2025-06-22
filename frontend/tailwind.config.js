/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: '#0f0f0f',
        surface: 'rgba(255, 255, 255, 0.05)',
        borderGlass: 'rgba(255, 255, 255, 0.2)',
        neon: '#00ffe5',
        neonBlue: '#00bfff',
        neonPink: '#ff00e5',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        neon: '0 0 10px #00ffe5, 0 0 20px #00ffe5',
        glow: '0 0 8px rgba(0, 255, 229, 0.7)',
      },
    },
  },
  plugins: [],
};