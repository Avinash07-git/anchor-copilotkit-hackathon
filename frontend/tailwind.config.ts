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
            50:  '#eef0ff',
            100: '#e0e4ff',
            200: '#c5cbff',
            400: '#7c83f5',
            500: '#5b63eb',
            600: '#4f46e5', // primary
            700: '#4338ca',
            800: '#3730a3',
            900: '#1e1b4b',
          },
          coral: {
            50:  '#fff1f2',
            100: '#ffe4e6',
            200: '#fecdd3',
            300: '#fda4af',
            400: '#fb7185', // accent
            500: '#f43f5e',
            600: '#e11d48',
          },
          cream:  { 50: '#fdfbf7', 100: '#fbf7f0', 200: '#f5efe3' },
          ink:    { 100: '#3f3a4a', 300: '#2a2632', 600: '#1f1b2c', 900: '#0f0d18' },
          mist:   { 50: '#f1ede4', 100: '#e7e2d8', 200: '#d4cfc3', 400: '#a39e92' },
        },
        state: {
          green:  '#16a34a',
          yellow: '#ca8a04',
          amber:  '#d97706',
          red:    '#dc2626',
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
        glow:  '0 0 0 4px rgba(79, 70, 229, 0.15)',
      },
      backgroundImage: {
        'cream-gradient':  'linear-gradient(180deg, #fdfbf7 0%, #fbf7f0 60%, #f5efe3 100%)',
        'indigo-gradient': 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
        'coral-gradient':  'linear-gradient(135deg, #fb7185 0%, #f43f5e 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
