import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00B894',      // Bright Green - Active, go, delivery
          hover: '#00A383',
          light: '#E0F5F1',
        },
        secondary: {
          DEFAULT: '#2D3436',      // Dark Gray - Professionalism
          hover: '#1E2426',
          light: '#DFE6E9',
        },
        accent: {
          DEFAULT: '#FDCB6E',      // Bright Yellow - Warnings, attention
          dark: '#F8B731',
        },
        neutral: {
          background: '#FAFBFC',   // Clean white-gray
          surface: '#FFFFFF',       // Task cards
          'text-primary': '#2D3436',
          'text-secondary': '#636E72',
          border: '#E1E5E9',
        },
        status: {
          active: '#00B894',        // Active delivery
          available: '#74B9FF',     // Available for pickup
          completed: '#A29BFE',     // Completed delivery
          urgent: '#FD79A8',        // Urgent/delayed
        },
        success: {
          DEFAULT: '#00B894',
          light: '#E0F5F1',
          dark: '#00A383',
        },
        warning: {
          DEFAULT: '#FDCB6E',
          light: '#FEF5E7',
          dark: '#F8B731',
        },
        error: {
          DEFAULT: '#FD79A8',
          light: '#FFE8F0',
          dark: '#E84393',
        },
        info: {
          DEFAULT: '#74B9FF',
          light: '#E3F2FD',
          dark: '#0984E3',
        },
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0,0,0,0.05)',
        'md': '0 4px 6px rgba(0,0,0,0.07)',
        'lg': '0 10px 15px rgba(0,0,0,0.1)',
        'xl': '0 20px 25px rgba(0,0,0,0.15)',
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
      },
    },
  },
  plugins: [],
} satisfies Config;

