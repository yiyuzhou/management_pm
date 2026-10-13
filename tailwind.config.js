/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './types/**/*.{ts,js}',
    './composables/**/*.{ts,js}',
    './utils/**/*.{ts,js}',
    './app.vue',
    './error.vue'
  ],
  safelist: [
    'bg-red-50', 'text-red-600',
    'bg-orange-50', 'text-orange-600',
    'bg-yellow-50', 'text-yellow-600',
    'bg-green-50', 'text-green-600',
    'bg-blue-50', 'text-blue-600',
    'bg-indigo-50', 'text-indigo-600',
    'bg-gray-50', 'text-gray-500',
    'bg-gray-100', 'text-gray-400'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a'
        }
      }
    }
  },
  plugins: []
}
