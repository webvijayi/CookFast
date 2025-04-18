/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/contexts/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          '50': '#f5f7ff',
          '100': '#ebf0fe',
          '200': '#dbe3fe',
          '300': '#bfccfb',
          '400': '#9eaff8',
          '500': '#7a8ff4',
          '600': '#5d6eec',
          '700': '#4957db',
          '800': '#3a44b1',
          '900': '#323d8f',
        },
      },
    },
  },
  plugins: [],
}
