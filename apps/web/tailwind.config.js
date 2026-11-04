/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      opacity: {
        2: '0.02',
        3: '0.03',
        4: '0.04',
        6: '0.06',
        7: '0.07',
        8: '0.08',
        9: '0.09',
        12: '0.12',
        15: '0.15',
        35: '0.35',
        45: '0.45',
        55: '0.55',
        65: '0.65',
        85: '0.85',
        97: '0.97',
      },
      colors: {
        plum: '#271A3B',
        navy: '#242B55',
        periwinkle: '#8793BC',
        lavender: '#C7B7DF',
        berry: '#E8A1B5',
        rosecream: '#F6DDE2',
        parchment: '#FFF5E8',
        vanilla: '#FAECD8',
        gold: '#D6AC69',
        forest: '#506A55',
        ink: '#3B2C43',
      },
      fontFamily: {
        body: ['"Vazirmatn Variable"', 'Vazirmatn', 'Tahoma', 'sans-serif'],
        display: ['"Estedad Variable"', 'Estedad', '"Vazirmatn Variable"', 'serif'],
        wordmark: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      boxShadow: {
        glow: '0 0 40px -8px rgba(214,172,105,0.45)',
        book: '0 18px 40px -18px rgba(39,26,59,0.45), 0 2px 0 rgba(255,255,255,0.4) inset',
        lantern: '0 10px 30px -6px rgba(232,161,181,0.35)',
        card: '0 24px 60px -30px rgba(39,26,59,0.35)',
      },
      backgroundImage: {
        'night-sky':
          'radial-gradient(120% 90% at 78% 8%, #3b3163 0%, #2b2453 38%, #201a3c 68%, #161126 100%)',
        'parchment-wash':
          'radial-gradient(100% 80% at 15% 0%, #fffaf2 0%, #fff5e8 45%, #faecd8 100%)',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '0.25', transform: 'scale(0.85)' },
          '50%': { opacity: '1', transform: 'scale(1.1)' },
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        drift: {
          '0%': { transform: 'translate3d(0,0,0)', opacity: '0' },
          '15%': { opacity: '0.9' },
          '85%': { opacity: '0.8' },
          '100%': { transform: 'translate3d(-40px,-120px,0)', opacity: '0' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
        riseIn: {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(-200%)' },
        },
      },
      animation: {
        twinkle: 'twinkle 5s ease-in-out infinite',
        floaty: 'floaty 7s ease-in-out infinite',
        drift: 'drift 18s linear infinite',
        glowPulse: 'glowPulse 6s ease-in-out infinite',
        riseIn: 'riseIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        shimmer: 'shimmer 2.2s linear infinite',
      },
    },
  },
  plugins: [],
}
