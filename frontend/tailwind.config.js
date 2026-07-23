/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: '#080C14',       /* Deep Midnight Azure */
          panel: '#0E1424',    /* Crisp Glass Panel */
          card: '#141C33',     /* Interactive Glass Card */
          cardHover: '#1B2645',
          border: '#1E2945',
          accent: '#00F2FE',   /* Electric Cyan */
          emerald: '#00E676',  /* Vivid Emerald */
          violet: '#7C4DFF',   /* Plasma Violet */
          rose: '#FF1744',
          amber: '#FFC400'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(0, 242, 254, 0.35)',
        'glow-emerald': '0 0 25px -5px rgba(0, 230, 118, 0.35)',
        'glow-violet': '0 0 25px -5px rgba(124, 77, 255, 0.35)',
        'glass': '0 10px 40px -10px rgba(0, 0, 0, 0.5)'
      }
    },
  },
  plugins: [],
}
