/** Replace frontend/tailwind.config.js. If any old keyframes/animations are still used, merge them back under theme.extend. */
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
    },
  },
  plugins: [],
};
