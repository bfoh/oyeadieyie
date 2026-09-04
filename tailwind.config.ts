import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ebony: '#111111',
        'ebony-raised': '#181818',
        'ebony-card': '#1F1F1F',
        'ebony-line': '#272727',
        gold: '#D4AF37',
        'gold-dim': '#8C7423',
        ivory: '#F9F8F3',
        crimson: '#8B0000',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      // B2 spacing tokens only
      spacing: {
        0: '0px', 25: '2px', 50: '4px', 75: '8px', 100: '12px',
        200: '16px', 300: '24px', 400: '32px', 500: '40px',
        600: '48px', 700: '64px', 800: '80px', 900: '96px',
      },
      transitionTimingFunction: {
        fluid: 'cubic-bezier(0.32,0.72,0,1)',
      },
      maxWidth: { measure: '680px' },
    },
  },
  plugins: [],
};
export default config;
