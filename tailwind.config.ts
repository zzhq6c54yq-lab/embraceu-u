import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "glow-pulse": {
          "0%, 100%": { 
            boxShadow: "0 0 8px 2px hsl(32 80% 50% / 0.6), 0 0 16px 4px hsl(32 80% 50% / 0.3)",
          },
          "50%": { 
            boxShadow: "0 0 12px 4px hsl(32 80% 55% / 0.8), 0 0 24px 8px hsl(32 80% 50% / 0.4)",
          },
        },
        "glow-pulse-intense": {
          "0%, 100%": { 
            boxShadow: "0 0 12px 4px hsl(32 90% 55% / 0.9), 0 0 24px 8px hsl(32 90% 50% / 0.5), 0 0 36px 12px hsl(32 80% 45% / 0.3)",
          },
          "50%": { 
            boxShadow: "0 0 18px 6px hsl(32 95% 60% / 1), 0 0 32px 12px hsl(32 90% 55% / 0.6), 0 0 48px 16px hsl(32 80% 50% / 0.4)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.4s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "glow-pulse-intense": "glow-pulse-intense 1.5s ease-in-out infinite",
      },
      boxShadow: {
        soft: "0 4px 20px -4px hsl(210 30% 70% / 0.2)",
        card: "0 8px 32px -8px hsl(210 30% 70% / 0.15)",
        elevated: "0 12px 48px -12px hsl(210 30% 60% / 0.25)",
        "pro-glow": "0 0 40px hsl(42 85% 52% / 0.5), 0 0 80px hsl(42 85% 52% / 0.25), 0 0 120px hsl(45 90% 68% / 0.15)",
        "pro-inner": "inset 0 1px 0 hsl(45 95% 80% / 0.4), inset 0 -1px 0 hsl(38 80% 30% / 0.3)",
        "pro-luxe": "0 10px 40px hsl(42 85% 45% / 0.4), 0 0 100px hsl(42 85% 52% / 0.2), 0 2px 4px hsl(38 80% 30% / 0.3)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
