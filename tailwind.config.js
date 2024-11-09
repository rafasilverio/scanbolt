/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        brand: {
          primary: "#4d00fc",    // Main purple
          white: "#fefefe",      // White
          darker: "#240063",     // Darkest purple
          dark: "#30008f",       // Dark purple
          warning: "#FFB800",    // Yellow for warnings/notices
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#4d00fc",    // Using exact brand color
          foreground: "#fefefe", // Using brand white
        },
        secondary: {
          DEFAULT: "#30008f",    // Using brand dark
          foreground: "#fefefe", // Using brand white
        },
        destructive: {
          DEFAULT: "#ef4444",    // Red for critical issues
          foreground: "#fefefe",
        },
        muted: {
          DEFAULT: "#f3f4f6",    // Light gray
          foreground: "#6b7280",
        },
        accent: {
          DEFAULT: "#240063",    // Using brand darker
          foreground: "#fefefe",
        },
        popover: {
          DEFAULT: "#fefefe",
          foreground: "#240063",
        },
        card: {
          DEFAULT: "#fefefe",
          foreground: "#240063",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}