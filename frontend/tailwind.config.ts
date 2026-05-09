import type { Config } from 'tailwindcss';

// Bedside palette — calm, accessible, WCAG AA on every pairing.
// Blue is the trust anchor; spark-yellow is reserved for attention prompts;
// red/amber/green only ever appear with an icon + label so the UI is
// color-blind safe (paired-encoding rule, see SCREENS notes in spec §10).
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bedside: {
          blue:   { 100: '#0053e2', 110: '#004ad1', 130: '#003fb8' },
          spark:  { 10:  '#fff5d6', 100: '#ffc220', 140: '#995213' },
          red:    { 10:  '#ffe5e1', 100: '#ea1100' },
          amber:  { 10:  '#fff1d4', 100: '#d97706' },
          green:  { 10:  '#dcfce7', 100: '#2a8703' },
          gray:   { 10:  '#f5f5f5', 50:  '#cfcfcf', 100: '#8a8a8a', 160: '#1a1a1a' },
        },
        // State semantic colors — always paired with icon + label (color-blind safe).
        state: {
          green:  '#2a8703',
          yellow: '#d4a017',
          amber:  '#d97706',
          red:    '#ea1100',
          gray:   '#8a8a8a',
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
