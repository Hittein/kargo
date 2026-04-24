/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0A1628',
        amber: '#FF6B35',
        gold: '#F7B500',
        sand: '#F5EFE6',
        mist: '#EEF2F7',
        slate2: '#475569',
        navy: '#0A1E5B',
        cyan: '#4DB8D6',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
