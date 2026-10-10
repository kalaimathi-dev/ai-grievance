/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f5f7fb',
          100: '#e9eef7',
          200: '#cdd9ee',
          300: '#a2b9df',
          400: '#7799cf',
          500: '#4e79b8',
          600: '#345b94',
          700: '#294777',
          800: '#203861',
          900: '#12203d'
        },
        civic: {
          50: '#eefbf8',
          100: '#d4f6ef',
          200: '#a6ebdf',
          300: '#72ddc9',
          400: '#3fc6b0',
          500: '#1ca18d',
          600: '#157e71',
          700: '#135f57',
          800: '#114c46',
          900: '#0e3d39'
        },
        warning: {
          50: '#fff9ec',
          100: '#fff1c8',
          200: '#ffe28d',
          300: '#ffd14b',
          400: '#f7bc14',
          500: '#d79a08',
          600: '#b17606',
          700: '#8d5708',
          800: '#73440d',
          900: '#5f380f'
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'sans-serif']
      },
      boxShadow: {
        civic: '0 24px 80px rgba(18, 32, 61, 0.14)'
      },
      backgroundImage: {
        'civic-grid': 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)'
      }
    }
  },
  plugins: []
};