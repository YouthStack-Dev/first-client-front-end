/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sidebar Theme Colors
        sidebar: {
          // Primary background gradient
          primary: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
            950: '#172554'
          },
          // Secondary colors for accents
          secondary: {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a'
          },
          // Success/Active states
          accent: {
            50: '#ecfdf5',
            100: '#d1fae5',
            200: '#a7f3d0',
            300: '#6ee7b7',
            400: '#34d399',
            500: '#10b981',
            600: '#059669',
            700: '#047857',
            800: '#065f46',
            900: '#064e3b'
          },
          // Warning/Hover states
          warning: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f'
          },
          // Danger/Error states
          danger: {
            50: '#fef2f2',
            100: '#fee2e2',
            200: '#fecaca',
            300: '#fca5a5',
            400: '#f87171',
            500: '#ef4444',
            600: '#dc2626',
            700: '#b91c1c',
            800: '#991b1b',
            900: '#7f1d1d'
          }
        },
        // App Theme Colors (for the rest of your app)
        app: {
          background: '#f8fafc',
          surface: '#ffffff',
          border: '#e2e8f0',
          text: {
            primary: '#1e293b',
            secondary: '#64748b',
            muted: '#94a3b8'
          }
        }
      },
      // Custom gradients for sidebar
      backgroundImage: {
        'sidebar-gradient': 'linear-gradient(to bottom, var(--tw-gradient-stops))',
        'sidebar-primary': 'linear-gradient(135deg, #60a5fa 0%, #bfdbfe 50%, #60a5fa 100%)', // light blue
        'sidebar-active': 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)', // blue-500 to blue-400
        'sidebar-hover': 'linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%)', // blue-300 to blue-400
      },
      
      // Custom spacing for sidebar
      spacing: {
        'sidebar': '16rem', // 256px - w-64
        'sidebar-collapsed': '4rem', // 64px - w-16
      },
      // Custom shadows for sidebar
      boxShadow: {
        'sidebar': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'sidebar-item': '0 4px 6px -1px rgba(59, 130, 246, 0.1)',
        'sidebar-item-hover': '0 10px 15px -3px rgba(59, 130, 246, 0.2)',
      },
      // Animation durations
      transitionDuration: {
        '400': '400ms',
      },
      // Custom border radius
      borderRadius: {
        'sidebar': '0.75rem',
      }
    },
  },
  plugins: [],
  // Add custom CSS variables (optional)
  safelist: [
    // Ensure these classes are always included
    'from-sidebar-primary-500',
    'via-sidebar-primary-500',
    'to-sidebar-primary-500',
    'from-sidebar-primary-500',
    'to-sidebar-primary-100',
    'shadow-sidebar',
    'shadow-sidebar-item',
    'shadow-sidebar-item-hover',
  ]
}