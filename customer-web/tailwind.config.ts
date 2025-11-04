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
          DEFAULT: '#FF6B35',
          hover: '#FF5722',
          light: '#FFE5DC',
        },
        secondary: {
          DEFAULT: '#4ECDC4',
          hover: '#3DBDB3',
          light: '#E0F7F5',
        },
        accent: {
          DEFAULT: '#FFD93D',
          dark: '#FFC107',
        },
        neutral: {
          background: '#F8F9FA',
          surface: '#FFFFFF',
          'text-primary': '#2D3436',
          'text-secondary': '#636E72',
          border: '#E1E5E9',
        },
        status: {
          success: '#26C281',
          warning: '#F39C12',
          error: '#E74C3C',
          info: '#3498DB',
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

