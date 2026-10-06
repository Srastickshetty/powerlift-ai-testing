/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    screens: { sm: "640px", md: "768px", lg: "1024px", xl: "1280px" },
    extend: {
      colors: {
        bg: "var(--bg)", surface: "var(--surface)", raised: "var(--raised)", line: "var(--line)",
        ink: "var(--text)", muted: "var(--muted)", accent: "var(--accent)", "accent-ink": "var(--accent-ink)",
        ok: "var(--ok)", warn: "var(--warn)", danger: "var(--danger)", info: "var(--info)",
      },
      fontFamily: { display: ["Barlow Condensed", "Inter", "sans-serif"], sans: ["Inter", "system-ui", "sans-serif"] },
      borderRadius: { sm: "8px", md: "12px", lg: "20px" },
      animation: {
        'spin-slow': 'spin 10s linear infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient-x': 'gradient-x 3s ease infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'left center' },
          '50%': { 'background-size': '200% 200%', 'background-position': 'right center' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0) rotateX(15deg) rotateY(25deg)' },
          '50%': { transform: 'translateY(-20px) rotateX(10deg) rotateY(10deg)' },
        }
      },
    },
  },
  plugins: [],
};