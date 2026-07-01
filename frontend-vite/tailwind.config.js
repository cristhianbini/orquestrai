// ATUALIZADO: 2026-07-01 17:48:35 -03:00 (auto, git pre-commit)
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#05080b',
        panel: '#0a0f14',
        line: '#1a2632',
        green: '#7CFFB2',
        cyan: '#7dd3fc',
        amber: '#f59e0b',
        muted: '#6b7280',
        err: '#ff9090',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'Menlo', 'monospace'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
}
