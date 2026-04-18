/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ── Palette from image ──
        c1: '#540000',   // deep red
        c2: '#57423F',   // warm brown
        c3: '#BFA6A2',   // dusty rose
        c4: '#0E3979',   // deep navy
        c5: '#4F67AE',   // medium blue
        // ── Semantic ──
        brand:   { DEFAULT: '#540000', hover: '#6B0000', soft: 'rgba(84,0,0,0.12)' },
        bg:      '#0D0E11',
        surface: { DEFAULT: '#161820', hover: '#1E2029' },
        border:  '#2A2E38',
        tx:      { 1: '#E5E7EB', 2: '#BFA6A2', 3: '#7A6E6C' },
        ok:      '#22C55E',
        warn:    '#F59E0B',
        err:     '#EF4444',
        info:    '#0E3979',
        accent:  '#4F67AE',
        // ── Legacy ghost-* classes ──
        ghost: {
          red:    '#540000',
          redlit: '#6B0000',
          glow:   '#540000',
          dark:   '#0D0E11',
          card:   '#161820',
          border: '#2A2E38',
          muted:  '#7A6E6C',
        },
        'g-success': '#22C55E',
        'g-warning': '#F59E0B',
        'g-error':   '#EF4444',
        'g-info':    '#0E3979',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: { DEFAULT: '8px', lg: '12px', xl: '16px' },
      transitionDuration: { DEFAULT: '200ms' },
      animation: {
        'fade-in':  'fadeIn .2s ease',
        'slide-up': 'slideUp .22s ease',
        'spin-slow':'spin 1.1s linear infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 },                              to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
