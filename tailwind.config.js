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
        point: '#C92B2A',
        main: '#2B2B2B',
        secondary: '#6E6E6E',
        emphasis: '#1F2A37',
        'deep-red': '#C92B2A',
        'deep-red-dark': '#1F2A37',
        'deep-red-light': '#C92B2A',
      },
      backgroundImage: {
        'gradient-dmc': 'linear-gradient(to bottom, #C92B2A, #1F2A37)',
        'gradient-dmc-horizontal': 'linear-gradient(to right, #C92B2A, #1F2A37)',
      },
      fontFamily: {
        'myeongjo': ['Nanum Myeongjo', 'Noto Serif KR', 'serif'],
      },
    },
  },
  plugins: [],
}
