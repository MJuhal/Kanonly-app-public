/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kb-bg': '#0F0F0F',
        'kb-card': '#1A1A1A',
        'kb-border': '#2A2A2A',
        'kb-hover': '#252525',
        'kb-text': '#FFFFFF',
        'kb-text-secondary': '#888888',
        'kb-inprogress': '#E5A853',
        'kb-complete': '#4ADE80',
      },
    },
  },
  plugins: [],
}
