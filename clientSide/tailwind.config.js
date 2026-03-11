/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
  ],
  prefix: "",
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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        brand: {
            50: "#fff8ec",
            100: "#ffedd1",
            200: "#ffd29e",
            300: "#ffb263",
            400: "#fc9928",
            500: "#f98602", // Primary Logo Orange
            600: "#e36303", // Darker Logo Orange
            700: "#b64a00",
            800: "#923d06",
            900: "#78320b",
            950: "#411702",
        },
        navy: {
            50: "#f4f7f9",
            100: "#e4ecf1",
            200: "#ccdbe4",
            300: "#a9c3d2",
            400: "#7fa4ba",
            500: "#5d86a0",
            600: "#446b86",
            700: "#37556c",
            800: "#30485b",
            900: "#023652",
            950: "#012335", // Logo Night-Black
        },
        ocean: {
            50: "#f0f9fb",
            100: "#dcf0f6",
            500: "#118bb0", // Logo Blue
            600: "#0e7292",
            700: "#034b60", // Darker Logo Blue
        },
        danger: {
            50: "#fdf3f3",
            100: "#fce5e4",
            500: "#d33a2f", // Logo Red
            600: "#bb2f25",
            700: "#871f19", // Darker Logo Red
        },
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
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
          },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require('daisyui')
  ],
}