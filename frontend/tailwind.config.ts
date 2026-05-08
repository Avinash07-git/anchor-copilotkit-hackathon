import type { Config } from 'tailwindcss';

// Walmart palette tokens — used across all A2UI components for WCAG AA compliance.
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        walmart: {
          blue:   { 100: '#0053e2', 110: '#004ad1', 130: '#003fb8' },
          spark:  { 10:  '#fff5d6', 100: '#ffc220', 140: '#995213' },
          red:    { 100: '#ea1100' },
          green:  { 100: '#2a8703' },
          gray:   { 10:  '#f5f5f5', 50:  '#cfcfcf', 100: '#8a8a8a', 160: '#1a1a1a' },
        },
        // Verdict semantic colors (always paired with icon + label for color-blind safety)
        verdict: {
          fair:      '#2a8703',  // green
          ambiguous: '#ffc220',  // yellow
          illegal:   '#ea1100',  // red
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
