/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb', // Blue 600 - Main theme color (from logo)
        secondary: '#10b981', // Green 500 - Secondary color (from logo)
        accent: '#06b6d4', // Cyan 500 - Accent color
        danger: '#ef4444', // Red 500 - Keep for errors
        logoBlue: '#1e40af', // Blue 800 - Logo blue
        logoGreen: '#10b981', // Green 500 - Logo green
        logoCyan: '#00D9FF', // Cyan - Logo accent
      },
      fontFamily: {
        sans: ['Cairo', 'sans-serif'],
      },
      animation: {
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(180deg)' },
        },
      },
    },
  },
  plugins: [],
}
