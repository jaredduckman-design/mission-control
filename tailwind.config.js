/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#060816',
        panel: '#0d1226',
        panelAlt: '#121936',
        stroke: '#1d274d',
        glow: '#7c3aed',
        cyan: '#33d2ff',
        mint: '#59f2c1',
        amber: '#fbbf24',
        rose: '#fb7185'
      },
      boxShadow: {
        panel: '0 20px 60px rgba(0,0,0,0.35)'
      }
    },
  },
  plugins: [],
}
