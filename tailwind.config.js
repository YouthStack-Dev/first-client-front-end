/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {
      /* ===========================
         DESIGN SYSTEM COLORS
      ============================ */
      colors: {
        /* Sidebar Theme */
        sidebar: {
          primary: "#0369a1", // Deep Ocean Blue – active / main actions
          secondary: "#0284c7", // Ocean Blue – hover / borders
          tertiary: "#e0f2fe", // Very light ocean tint – background
        },

        /* App-wide Theme */
        app: {
          primary: "#38bdf8",
          secondary: "#7dd3fc",
          tertiary: "#e0f2fe",

          background: "#f8fafc",
          surface: "#ffffff",
          border: "#e2e8f0",

          text: {
            primary: "#0f172a",
            secondary: "#475569",
            muted: "#94a3b8",
          },
        },
      },

      /* ===========================
         GRADIENTS
      ============================ */
      backgroundImage: {
        "sidebar-gradient": "linear-gradient(135deg, #38bdf8 0%, #7dd3fc 100%)",
      },

      /* ===========================
         SPACING
      ============================ */
      spacing: {
        sidebar: "16rem", // w-sidebar
        "sidebar-collapsed": "4rem", // w-sidebar-collapsed
      },

      /* ===========================
         SHADOWS
      ============================ */
      boxShadow: {
        sidebar: "0 20px 40px rgba(56, 189, 248, 0.25)",
        "sidebar-item": "0 4px 6px rgba(56, 189, 248, 0.15)",
        "sidebar-item-hover": "0 8px 16px rgba(56, 189, 248, 0.25)",
      },

      /* ===========================
         BORDER RADIUS
      ============================ */
      borderRadius: {
        sidebar: "0.75rem",
      },

      /* ===========================
         TRANSITIONS
      ============================ */
      transitionDuration: {
        400: "400ms",
      },
    },
  },

  plugins: [],

  /* ===========================
     SAFE LIST (OPTIONAL)
  ============================ */
  safelist: [
    "bg-sidebar-primary",
    "bg-sidebar-secondary",
    "bg-sidebar-tertiary",
    "text-app-primary",
    "text-app-secondary",
    "border-sidebar-secondary",
    "shadow-sidebar",
    "shadow-sidebar-item",
    "shadow-sidebar-item-hover",
    "bg-sidebar-gradient",
  ],
};
