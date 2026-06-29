/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./navigation/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Primary — verde azulado cálido: confianza + educación
        primary: {
          50:  '#f0fdf6',
          100: '#dcfce9',
          200: '#bbf7d4',
          300: '#86efad',
          400: '#4ade7f',
          500: '#22c55e',
          600: '#16a34a', // main
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // Accent — azul suave para enlaces y acciones secundarias
        accent: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Neutros cálidos — no gris puro, sino con tinte cálido
        surface: {
          50:  '#fafaf9',  // fondo principal
          100: '#f5f5f4',  // fondo cards
          200: '#e7e5e4',  // bordes suaves
          300: '#d6d3d1',  // bordes activos
          400: '#a8a29e',  // texto terciario
          500: '#78716c',  // texto secundario
          600: '#57534e',  // texto regular
          700: '#44403c',  // texto principal
          800: '#292524',  // texto énfasis
          900: '#1c1917',  // texto máximo contraste
        },
        // Status — saturados pero no agresivos
        success: '#22c55e',
        warning: '#f59e0b',
        danger:  '#ef4444',
        info:    '#3b82f6',
      },
      fontFamily: {
        sans:      ['Inter_400Regular', 'System'],
        medium:    ['Inter_500Medium', 'System'],
        semibold:  ['Inter_600SemiBold', 'System'],
        bold:      ['Inter_700Bold', 'System'],
      },
      fontSize: {
        'xs':   ['12px', { lineHeight: '16px' }],
        'sm':   ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg':   ['18px', { lineHeight: '28px' }],
        'xl':   ['20px', { lineHeight: '28px' }],
        '2xl':  ['24px', { lineHeight: '32px' }],
        '3xl':  ['30px', { lineHeight: '36px' }],
      },
      spacing: {
        '4.5': '18px',
        '13':  '52px',
        '14':  '56px',  // touch target mínimo
        '15':  '60px',
        '18':  '72px',
        '22':  '88px',
      },
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'card':    '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-lg': '0 4px 12px rgba(0,0,0,0.08)',
        'button':  '0 2px 8px rgba(22,163,74,0.25)',
      },
    },
  },
  plugins: [],
};
