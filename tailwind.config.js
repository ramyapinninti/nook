/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nook: {
          beige: '#f5f5dc',
          sage: '#9caf88',
        }
      },
    },
  },
  plugins: [],
}
