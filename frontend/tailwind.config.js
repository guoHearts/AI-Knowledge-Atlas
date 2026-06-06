/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        cosmos: {
          bg: '#06090f',
          surface: '#0f1523',
          panel: '#111827',
          border: 'rgba(100, 130, 180, 0.12)',
          muted: '#5c6a85',
          text: '#dde4f0',
          dim: '#8892b0',
        },
        stellar: {
          blue: '#5b9cf5',
          cyan: '#38bdf8',
          violet: '#a78bfa',
          amber: '#fbbf24',
          emerald: '#34d399',
          rose: '#f472b6',
          orange: '#fb923c',
          slate: '#94a3b8',
          red: '#f87171',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
