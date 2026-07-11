import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

/**
 * Design tokens derive from the UVI brand mark (crowned lion):
 * amber-gold on deep violet. Dark-first.
 * Colors are exposed as CSS variables in globals.css so the 3D scene
 * and 2D UI share one source of truth.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand violet family
        violet: {
          DEFAULT: 'rgb(var(--c-violet) / <alpha-value>)',
          deep: 'rgb(var(--c-violet-deep) / <alpha-value>)',
          night: 'rgb(var(--c-violet-night) / <alpha-value>)',
        },
        // Brand amber/gold family
        gold: {
          DEFAULT: 'rgb(var(--c-gold) / <alpha-value>)',
          warm: 'rgb(var(--c-gold-warm) / <alpha-value>)',
        },
        sand: 'rgb(var(--c-sand) / <alpha-value>)',
        pearl: 'rgb(var(--c-pearl) / <alpha-value>)',
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px -8px rgb(var(--c-gold))',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        tide: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both',
        tide: 'tide 6s ease-in-out infinite',
      },
    },
  },
  plugins: [typography],
};

export default config;
