import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surfaces & Canvas
        canvas: "hsl(var(--canvas) / <alpha-value>)",
        surface: {
          DEFAULT: "hsl(var(--surface) / <alpha-value>)",
          elevated: "hsl(var(--surface-elevated) / <alpha-value>)",
          subtle: "hsl(var(--surface-subtle) / <alpha-value>)",
        },
        // Borders & Dividers
        border: {
          subtle: "hsl(var(--border-subtle) / <alpha-value>)",
          strong: "hsl(var(--border-strong) / <alpha-value>)",
          focus: "hsl(var(--border-focus) / <alpha-value>)",
        },
        // Typography Colors
        content: {
          primary: "hsl(var(--text-primary) / <alpha-value>)",
          secondary: "hsl(var(--text-secondary) / <alpha-value>)",
          tertiary: "hsl(var(--text-tertiary) / <alpha-value>)",
          muted: "hsl(var(--text-muted) / <alpha-value>)",
        },
        // Brand & Habit Status Semantics
        pulse: {
          DEFAULT: "hsl(var(--pulse-brand) / <alpha-value>)",
          done: "hsl(var(--habit-done) / <alpha-value>)",
          "done-bg": "hsl(var(--habit-done-bg) / <alpha-value>)",
          streak: "hsl(var(--habit-streak) / <alpha-value>)",
          "streak-bg": "hsl(var(--habit-streak-bg) / <alpha-value>)",
          rest: "hsl(var(--habit-rest) / <alpha-value>)",
          alert: "hsl(var(--habit-alert) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        display: ["2.0rem", { lineHeight: "1.15", letterSpacing: "-0.035em", fontWeight: "600" }],
        "title-lg": ["1.5rem", { lineHeight: "1.25", letterSpacing: "-0.025em", fontWeight: "600" }],
        "title-md": ["1.125rem", { lineHeight: "1.35", letterSpacing: "-0.02em", fontWeight: "500" }],
        body: ["0.9375rem", { lineHeight: "1.5", letterSpacing: "-0.01em", fontWeight: "400" }],
        "body-sm": ["0.8125rem", { lineHeight: "1.45", letterSpacing: "0", fontWeight: "400" }],
        caption: ["0.6875rem", { lineHeight: "1.35", letterSpacing: "+0.03em", fontWeight: "500" }],
        metric: ["1.375rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "600" }],
        "metric-sm": ["0.8125rem", { lineHeight: "1.0", letterSpacing: "0", fontWeight: "500" }],
      },
      borderRadius: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
      },
      boxShadow: {
        // Light Mode Multi-Layer Ambient Shadows
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 3px 0 rgba(0, 0, 0, 0.02)",
        elevated: "0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -2px rgba(0, 0, 0, 0.02)",
        floating: "0 12px 20px -4px rgba(0, 0, 0, 0.06), 0 4px 6px -2px rgba(0, 0, 0, 0.02)",
        modal: "0 24px 38px -6px rgba(0, 0, 0, 0.08), 0 9px 12px -4px rgba(0, 0, 0, 0.03)",
        // Dark Mode Luminous Edge Presets
        "dark-subtle": "0 0 0 1px rgba(255, 255, 255, 0.05)",
        "dark-elevated": "0 0 0 1px rgba(255, 255, 255, 0.08), 0 6px 16px -2px rgba(0, 0, 0, 0.6)",
        "dark-floating": "0 0 0 1px rgba(255, 255, 255, 0.1), 0 16px 32px -4px rgba(0, 0, 0, 0.75)",
        "pulse-glow": "0 0 20px -4px rgba(82, 183, 136, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
