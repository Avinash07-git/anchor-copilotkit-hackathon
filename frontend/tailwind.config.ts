import type { Config } from 'tailwindcss';

/**
 * Anchor design system.
 *
 * Premium-calm palette:
 *  - `anchor.indigo`  – the trust anchor. Deep, calm, decisive.
 *  - `anchor.coral`   – the warmth. Used for accents + warm CTAs.
 *  - `anchor.cream`   – the surface. Warmer than white, softer on the eye.
 *  - `anchor.ink`     – body text. Warm charcoal, never pure black.
 *  - `anchor.mist`    – borders + dividers. Barely-there.
 *
 * State colours (`state.*`) are reserved for severity signalling and are
 * always paired with an icon + label so the UI stays colour-blind safe.
 *
 * Every text/background pairing meets WCAG AA contrast.
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        anchor: {
          indigo: {
            50:  '#f5f3ff',
            100: '#ede9fe',
            200: '#C4B8F0', // header chip + focus rings
            400: '#8A7FE8',
            500: '#6B60E0',
            600: '#5B4FD9', // primary brand
            700: '#4A3FC0', // hover
            800: '#3B2FCF', // active chip text
            900: '#2C228A',
          },
          coral: {
            50:  '#fff0f3',
            100: '#ffe0e8',
            200: '#ffb3c4',
            300: '#ff85a1',
            400: '#E05A7A', // accent / alert left border
            500: '#C44466',
            600: '#a83355',
          },
          cream:  { 50: '#fdfbf7', 100: '#fbf7f0', 200: '#f5efe3' },
          ink:    { 100: '#6B6580', 300: '#2a2632', 600: '#1f1b2c', 900: '#0f0d18' },
          mist:   { 50: '#f1ede4', 100: '#D4CFC3', 200: '#c4bfb3', 400: '#a39e92' },
        },
        state: {
          green:  '#16a34a',
          'green-soft':  '#ecfdf5',
          yellow: '#ca8a04',
          'yellow-soft': '#fefce8',
          amber:  '#d97706',
          'amber-soft':  '#fff7ed',
          red:    '#dc2626',
          'red-soft':    '#fef2f2',
          gray:   '#737373',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Fraunces"', 'Inter', 'serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        soft:  '0 1px 2px rgba(31, 27, 44, 0.04), 0 4px 12px rgba(31, 27, 44, 0.04)',
        lift:  '0 2px 4px rgba(31, 27, 44, 0.06), 0 12px 32px rgba(31, 27, 44, 0.08)',
        glow:  '0 0 0 4px rgba(176, 111, 170, 0.15)',
      },
      backgroundImage: {
        'cream-gradient':  'linear-gradient(180deg, #fdfbf7 0%, #fbf7f0 60%, #f5efe3 100%)',
        'indigo-gradient': 'linear-gradient(135deg, #5B4FD9 0%, #3B2FCF 100%)',
        'coral-gradient':  'linear-gradient(135deg, #E05A7A 0%, #C44466 100%)',
        'brand-gradient':  'linear-gradient(135deg, #5B4FD9 0%, #C75B8A 60%, #E05A7A 100%)',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        rebuildSweep: {
          '0%':   { opacity: '0', transform: 'translateX(-100%)' },
          '40%':  { opacity: '1' },
          '100%': { opacity: '0', transform: 'translateX(100%)' },
        },
      },
      animation: {
        fadeIn:        'fadeIn 0.45s ease-out',
        rebuildSweep:  'rebuildSweep 1.1s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
