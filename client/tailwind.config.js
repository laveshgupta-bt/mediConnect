/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#061321',
          900: '#0A1A2F',
          800: '#102A43', // Primary
          700: '#1A365D',
          600: '#243B53',
          500: '#334E68',
          400: '#486581',
          300: '#627D98',
          200: '#829AB1',
          100: '#BCCCDC',
          50: '#F0F4F8'
        },
        teal: {
          900: '#0E625F',
          800: '#12807C',
          700: '#14918C',
          600: '#16A6A1', // Secondary Medical Teal
          500: '#20B9B3',
          400: '#38D9D3',
          300: '#65E3DF',
          200: '#94EFEA',
          100: '#C7F8F5',
          50: '#E6FFFA'
        },
        cyan: {
          400: '#00E5FF',
          500: '#00B4D8',
          600: '#0077B6',
        },
        surface: {
          DEFAULT: '#F7FAFC',
          card: '#FFFFFF',
          subtle: '#F1F5F9',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(16, 42, 67, 0.08)',
        'premium': '0 20px 40px -15px rgba(16, 42, 67, 0.07), 0 0 1px 1px rgba(16, 42, 67, 0.05)',
        'glow-teal': '0 0 25px rgba(22, 166, 161, 0.35)',
        'glow-cyan': '0 0 25px rgba(0, 180, 216, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
