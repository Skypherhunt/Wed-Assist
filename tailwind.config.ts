import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./config/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        primary: "var(--primary)",
        "primary-ink": "var(--primary-ink)",
        accent: "var(--accent)",
        "accent-2": "var(--accent-2)",
        line: "var(--line)",

        // Marketing landing page only — literal (non-themeable) editorial
        // palette, namespaced to avoid colliding with the per-wedding tokens
        // above. Kept as static hex (not CSS vars) so Tailwind's opacity
        // modifiers (e.g. `bg-land-primary/85`) work correctly.
        "land-primary": "#B76E79",
        "land-primary-dark": "#94515C",
        "land-primary-light": "#E0B9BF",
        "land-accent": "#C39B4E",
        "land-accent-dark": "#A6812F",
        "land-background": "#FAF6F1",
        "land-surface": "#FFFFFF",
        "land-ink": "#241C1E",
        "land-muted": "#857A76",
        "land-divider": "#EBE2DA",
        "land-deep": "#2E1D24",
      },
      fontFamily: {
        display: "var(--font-display)",
        body: "var(--font-body)",
        script: "var(--font-script)",
        // Marketing landing page only.
        serif: ['"Cormorant Garamond"', "serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      boxShadow: {
        soft: "0 10px 40px -12px var(--shadow)",
        glow: "0 0 0 1px var(--accent) inset, 0 8px 30px -10px var(--shadow)",
      },
      borderRadius: {
        xl2: "1.25rem",
        "4xl": "2rem", // landing page only
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        // Landing page only.
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "marquee-rev": {
          from: { transform: "translateX(-50%)" },
          to: { transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 1.1s ease both",
        float: "float 5s ease-in-out infinite",
        marquee: "marquee 32s linear infinite",
        "marquee-rev": "marquee-rev 32s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
