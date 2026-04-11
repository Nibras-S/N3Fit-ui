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
        // Brand — Rose/Red primary (#F43F5E = rose-500)
        brand: {
          50:  '#fff1f2',   // rose-50  — soft background tint
          100: '#ffe4e6',   // rose-100 — badge / input error bg
          200: '#fecdd3',   // rose-200 — borders (light)
          300: '#fda4af',   // rose-300 — muted accent
          400: '#fb7185',   // rose-400 — focus ring / hover state (dark mode)
          500: '#f43f5e',   // rose-500 — focus ring (light mode)
          600: '#f43f5e',   // rose-500 — PRIMARY BUTTON background
          700: '#e11d48',   // rose-600 — primary button hover
          800: '#be123c',   // rose-700 — primary button pressed / dark text
          900: '#9f1239',   // rose-800
          950: '#4c0519',   // rose-950
        },
        surface: {
          DEFAULT: "#f8fafc",
          muted: "#f3f4f6",
          card: "#ffffff",
        },
        dark: {
          DEFAULT: "#0b0f19",    // Main background (deep navy-black)
          bg2: "#111827",        // Secondary background / sections
          card: "#0f172a",       // Card background
          modal: "#151e2f",      // Modal / elevated card
          border: "#1e293b",     // Border default
          borderHover: "#334155",// Border hover
          muted: "#94a3b8",      // Muted text (slate-400)
          disabled: "#64748b",   // Disabled text (slate-500)
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
        soft: "0 2px 8px rgba(15,23,42,0.06)",
        card: "0px 8px 30px rgba(15,23,42,0.06)",
        "card-hover": "0px 12px 36px rgba(15,23,42,0.10)",
        "card-dark": "0px 10px 30px rgba(0,0,0,0.50)",
        glow: "0 0 40px rgba(244,63,94,0.15)",
        "glow-lg": "0 0 60px rgba(244,63,94,0.20)",
        "button-glow": "0px 10px 25px rgba(244,63,94,0.25)",
        "button-glow-dark": "0px 10px 30px rgba(244,63,94,0.35)",
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
        'brand-gradient': 'linear-gradient(135deg, #f43f5e, #e11d48, #be123c)',
        'brand-radial': 'radial-gradient(circle at 50% 50%, rgba(244,63,94,0.25) 0%, transparent 70%)',
        'hero-gradient': 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        'hero-gradient-dark': 'radial-gradient(circle at top, rgba(244,63,94,0.20), transparent 60%), linear-gradient(180deg, #0b0f19 0%, #111827 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(244,63,94,0.05), rgba(220,38,38,0.02))',
      },
    },
  },
  plugins: [],
};
