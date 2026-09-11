import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
    './maps/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'JetBrains Mono', 'monospace'],
      },
      colors: {
        risk: {
          low: {
            DEFAULT: '#10b981',
            bg: '#ecfdf5',
            text: '#065f46',
            border: '#a7f3d0',
          },
          moderate: {
            DEFAULT: '#f59e0b',
            bg: '#fffbeb',
            text: '#92400e',
            border: '#fde68a',
          },
          high: {
            DEFAULT: '#f97316',
            bg: '#fff7ed',
            text: '#9a3412',
            border: '#fed7aa',
          },
          critical: {
            DEFAULT: '#ef4444',
            bg: '#fef2f2',
            text: '#991b1b',
            border: '#fecaca',
          },
        },
        hydro: {
          DEFAULT: '#0284c7',
          light: '#e0f2fe',
          dark: '#0369a1',
        },
      },
      boxShadow: {
        'panel': '0 4px 20px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
        'floating': '0 2px 12px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.05)',
        'modal': '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 10px 10px -5px rgba(15, 23, 42, 0.04)',
      },
    },
  },
  plugins: [],
};

export default config;
