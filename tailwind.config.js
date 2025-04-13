/** @type {import('tailwindcss').Config} */
module.exports = {
  // Configure dark mode to use the 'dark' class on the html element
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}", // If you have a components directory
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}", // If using App Router (though you seem to use Pages)
  ],
  theme: {
    extend: {
      // You can extend your theme here if needed
    },
  },
  plugins: [
    // Add any Tailwind plugins here
  ],
}
