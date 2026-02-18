/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Outfit", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        // Blue-first SaaS theme
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',   // Primary CTA
          600: '#2563eb',   // Primary hover
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        surface: {
          DEFAULT: "#f8fafc",
          muted: "#f1f5f9",
          card: "#ffffff",
        },
        dark: {
          DEFAULT: "#0f172a",     // Main background
          card: "#1e293b",     // Card background
          border: "#334155",     // Border color
          muted: "#475569",     // Muted text
        },
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0,0,0,0.06)",
        card: "0 4px 12px rgba(0,0,0,0.08)",
        "card-hover": "0 8px 24px rgba(0,0,0,0.12)",
        glow: "0 0 40px rgba(59,130,246,0.15)",
        "glow-lg": "0 0 60px rgba(59,130,246,0.25)",
        "blue-sm": "0 4px 14px rgba(59,130,246,0.25)",
        "blue-lg": "0 8px 30px rgba(59,130,246,0.35)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "float": "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 3s infinite",
        "pulse-slow": "pulse 4s ease-in-out infinite",
        "counter": "counter 2s ease-out forwards",
        "gradient": "gradientShift 8s ease infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      backgroundImage: {
        'blue-gradient': 'linear-gradient(135deg, #3b82f6, #2563eb, #1d4ed8)',
        'blue-radial': 'radial-gradient(circle at 50% 50%, rgba(59,130,246,0.15) 0%, transparent 70%)',
        'hero-gradient': 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(59,130,246,0.05), rgba(37,99,235,0.02))',
      },
    },
  },
  plugins: [],
};
