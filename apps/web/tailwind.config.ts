import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: '#F97316',
        'brand-dark': '#C2410C',
        'brand-light': '#FED7AA',
        correct: '#4ADE80',
        'correct-dark': '#16A34A',
        wrong: '#F43F5E',
        'wrong-dark': '#BE123C',
        'score-text': '#FACC15',
        'game-bg': '#1E1B4B',
        'game-card': '#2D2A5E',
        'student-bg': '#F8FAFC',
        'teacher-bg': '#F8FAFC',
      },
      fontFamily: {
        pretendard: ['Pretendard Variable', 'Pretendard', 'sans-serif'],
        'space-grotesk': ['Space Grotesk', 'sans-serif'],
      },
      animation: {
        'burst': 'burst-scale 200ms ease-out',
        'shake-x': 'shake-x 300ms ease-in-out',
        'float-up': 'float-up 1000ms ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-in': 'bounce-in 400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        'fade-in-up': 'fade-in-up 500ms ease-out',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        'burst-scale': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.08)', filter: 'brightness(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
        'shake-x': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-6px)' },
          '40%': { transform: 'translateX(6px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
        },
        'float-up': {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-60px)', opacity: '0' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.7)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'fade-in-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;
