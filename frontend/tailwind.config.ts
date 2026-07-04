import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'cosmos-bg': '#eef2ed',
        'cosmos-surface': '#fffefa',
        'cosmos-border': 'rgba(24, 32, 28, 0.13)',
        'cosmos-text': '#17201c',
        'cosmos-dim': '#66736d',
        'stellar-blue': '#2358d8',
        'stellar-violet': '#8b3f97',
        'stellar-emerald': '#0e8f72',
        'stellar-amber': '#c78310',
        'stellar-rose': '#cc4b4b',
      },
      fontFamily: {
        display: ['Georgia', 'Cambria', 'serif'],
        body: ['ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out',
        'fade-up-delay': 'fadeUp 0.5s ease-out 0.1s both',
        'fade-up-delay-2': 'fadeUp 0.5s ease-out 0.2s both',
        'fade-up-delay-3': 'fadeUp 0.5s ease-out 0.3s both',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.4s ease-out',
        'pulse-ring': 'pulseRing 1.8s ease-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'scale-in': 'scaleIn 0.3s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.8)', opacity: '0.6' },
          '100%': { transform: 'scale(1.4)', opacity: '0' },
        },
        glow: {
          '0%': { boxShadow: '0 0 0 rgba(35, 88, 216, 0)' },
          '100%': { boxShadow: '0 18px 45px rgba(35, 88, 216, 0.16)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
