import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          50: "var(--color-primary-50)",
          100: "var(--color-primary-100)",
          200: "var(--color-primary-200)",
          300: "var(--color-primary-300)",
          400: "var(--color-primary-400)",
          500: "var(--color-primary-500)",
          600: "var(--color-primary-600)",
          700: "var(--color-primary-700)",
          800: "var(--color-primary-800)",
          900: "var(--color-primary-900)",
        },
        gray: {
          50: "var(--color-gray-50)",
          100: "var(--color-gray-100)",
          200: "var(--color-gray-200)",
          300: "var(--color-gray-300)",
          400: "var(--color-gray-400)",
          500: "var(--color-gray-500)",
          600: "var(--color-gray-600)",
          700: "var(--color-gray-700)",
          800: "var(--color-gray-800)",
          900: "var(--color-gray-900)",
        },
        success: {
          50: "var(--color-success-50)",
          500: "var(--color-success-500)",
          700: "var(--color-success-700)",
        },
        warning: {
          50: "var(--color-warning-50)",
          500: "var(--color-warning-500)",
          700: "var(--color-warning-700)",
        },
        danger: {
          50: "var(--color-danger-50)",
          500: "var(--color-danger-500)",
          700: "var(--color-danger-700)",
        },
        info: {
          50: "var(--color-info-50)",
          500: "var(--color-info-500)",
          700: "var(--color-info-700)",
        },
      },
      spacing: {
        1: "var(--space-1)",
        2: "var(--space-2)",
        3: "var(--space-3)",
        4: "var(--space-4)",
        5: "var(--space-5)",
        6: "var(--space-6)",
        8: "var(--space-8)",
        10: "var(--space-10)",
        12: "var(--space-12)",
        16: "var(--space-16)",
      },
      fontSize: {
        xs: ["var(--text-xs)", { lineHeight: "var(--text-xs-line-height)" }],
        sm: ["var(--text-sm)", { lineHeight: "var(--text-sm-line-height)" }],
        base: ["var(--text-base)", { lineHeight: "var(--text-base-line-height)" }],
        lg: ["var(--text-lg)", { lineHeight: "var(--text-lg-line-height)" }],
        xl: ["var(--text-xl)", { lineHeight: "var(--text-xl-line-height)" }],
        "2xl": ["var(--text-2xl)", { lineHeight: "var(--text-2xl-line-height)" }],
        "3xl": ["var(--text-3xl)", { lineHeight: "var(--text-3xl-line-height)" }],
        "4xl": ["var(--text-4xl)", { lineHeight: "var(--text-4xl-line-height)" }],
      },
    },
  },
  plugins: [],
};
export default config;
