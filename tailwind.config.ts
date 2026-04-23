import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 20px 60px rgba(15, 23, 42, 0.08)',
      },
      backgroundImage: {
        'hero-blue':
          'radial-gradient(circle at top left, rgba(59, 130, 246, 0.18), transparent 28%), radial-gradient(circle at 80% 20%, rgba(14, 165, 233, 0.16), transparent 26%)',
      },
      keyframes: {
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        floatSlow: 'floatSlow 7s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
