/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#0ea5e9', // cyan/tech accent
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        navy: {
          950: '#070b14',
          900: '#0b1324',
          850: '#0f1c34',
          800: '#152445',
          700: '#1f345e',
          600: '#2b477d',
        },
        circuit: {
          glow: '#00F0FF',
          accent: '#10B981',
          amber: '#F59E0B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'circuit-pattern': "radial-gradient(circle at 1px 1px, rgba(14, 165, 233, 0.15) 1px, transparent 0)",
      }
    },
  },
  plugins: [],
};
