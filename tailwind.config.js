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
        // Brand — Black/Zinc primary
        brand: {
          50:  '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#18181b',   // PRIMARY BUTTON background
          700: '#27272a',   // button hover
          800: '#3f3f46',   // button pressed
          900: '#09090b',
          950: '#000000',
        },
        surface: {
          DEFAULT: "#f8fafc",
          muted: "#f3f4f6",
          card: "#ffffff",
        },
        // ── Dark palette: pure black + neutral grey (no blue/indigo) ──
        dark: {
          DEFAULT: "#0d0d0d",    // Main bg — near pure black
          bg2: "#141414",        // Secondary bg / sections
          card: "#1c1c1c",       // Card bg
          modal: "#202020",      // Modal / elevated surface
          border: "#2a2a2a",     // Border default
          borderHover: "#3a3a3a",// Border hover
          muted: "#888888",      // Muted text
          disabled: "#555555",   // Disabled text
        },
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },
      borderRadius: {
        // Buttons use rounded-lg (8px) — medium, clean, professional
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0,0,0,0.08)",
        card: "0px 8px 30px rgba(0,0,0,0.06)",
        "card-hover": "0px 12px 36px rgba(0,0,0,0.10)",
        "card-dark": "0px 10px 30px rgba(0,0,0,0.60)",
        glow: "0 0 40px rgba(0,0,0,0.12)",
        "glow-lg": "0 0 60px rgba(0,0,0,0.18)",
        "button-glow": "0px 10px 25px rgba(0,0,0,0.20)",
        "button-glow-dark": "0px 10px 30px rgba(0,0,0,0.40)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "float": "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 3s infinite",
        "pulse-slow": "pulse 4s ease-in-out infinite",
        "gradient": "gradientShift 8s ease infinite",
        "bounce-dot": "bounceDot 1.2s infinite ease-in-out",
        // Used by AppLayout dropdowns/modals after we ripped out framer-motion.
        // Open-only animations — closes are instant unmounts (the standard
        // tradeoff for dropping AnimatePresence's exit choreography).
        "dropdown-in": "dropdownIn 0.15s ease-out",
        "popup-in": "popupIn 0.15s ease-out",
        "modal-in": "modalIn 0.2s ease-out",
        "slide-in-left": "slideInLeft 0.2s ease-out",
        "page-in": "pageIn 0.2s ease-out",
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
        dropdownIn: {
          "0%": { opacity: "0", transform: "translateY(-4px) scale(0.97)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        popupIn: {
          "0%": { opacity: "0", transform: "translateY(8px) scale(0.96)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        modalIn: {
          "0%": { opacity: "0", transform: "translateY(20px) scale(0.9)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        slideInLeft: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        pageIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
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
        bounceDot: {
          "0%, 80%, 100%": { transform: "scale(0.8)", opacity: "0.5" },
          "40%": { transform: "scale(1.1)", opacity: "1" },
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #18181b, #27272a, #3f3f46)',
        'brand-radial': 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.08) 0%, transparent 70%)',
        'hero-gradient': 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        'hero-gradient-dark': 'linear-gradient(180deg, #0d0d0d 0%, #141414 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(0,0,0,0.02), rgba(0,0,0,0.01))',
      },
    },
  },
  plugins: [],
};
