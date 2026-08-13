/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'efc-dark': '#0f172a',
        'efc-card': '#1e293b',
        'efc-accent': '#3b82f6',
        'efc-success': '#22c55e',
        'efc-warning': '#f59e0b',
        'efc-danger': '#ef4444',
        'efc-text': '#f1f5f9',
        'efc-muted': '#94a3b8',
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}
