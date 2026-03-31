/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        green: {
          primary: '#00e676',
          dark: '#1a2e1a',
          mid: '#336633',
          light: '#e0f7e0',
          muted: '#aaccaa',
        },
      },
    },
  },
  plugins: [],
}
