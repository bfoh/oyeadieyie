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
        wordmark: ['var(--font-wordmark)', 'Didot', 'Bodoni MT', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      /* Numeric weight tokens.
         The components have always written font-500, font-600 and font-700,
         but Tailwind ships named weights only (font-semibold), so all 61 of
         those classes silently produced nothing and every heading on the site
         rendered at 400. Declaring them makes the markup mean what it says. */
      fontWeight: {
        400: '400',
        500: '500',
        600: '600',
        700: '700',
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
