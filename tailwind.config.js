/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        yellow: '#FFD600',
        orange: '#FF6B35',
        'bg-primary': '#0A0A0A',
        'border-dark': '#2D2D2D',
        'border-subtle': '#1D1D1D',
      },
      fontFamily: {
        grotesk: ['Space Grotesk', 'sans-serif'],
        'ibm-mono': ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
