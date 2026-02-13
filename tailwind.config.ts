import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: '#0E1111',
        foreground: '#F5F7F6',
        accent: '#0E8F52',
        muted: '#141818'
      }
    }
  },
  plugins: []
};

export default config;
