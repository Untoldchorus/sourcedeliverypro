import type { Config } from 'tailwindcss'
import { fontFamily } from 'tailwindcss/defaultTheme'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        // SourceDeliveryPro Brand Colors
        navy: {
          DEFAULT: '#1B2A4A',
          50: '#E8EBF2',
          100: '#C5CCE0',
          200: '#97A3C5',
          300: '#697BAA',
          400: '#435890',
          500: '#1B2A4A',
          600: '#142038',
          700: '#0E1628',
          800: '#090E1A',
          900: '#04070D',
          950: '#020306',
        },
        orange: {
          DEFAULT: '#6B2737',
          50: '#F9EEF0',
          100: '#EEDCDE',
          200: '#D9AEB4',
          300: '#C27F88',
          400: '#A85060',
          500: '#6B2737',
          600: '#4A1520',
          700: '#36101A',
          800: '#220B11',
          900: '#0E0508',
        },
        // Marketing Theme — Oxblood + Dark Blue
        oxblood: {
          DEFAULT: '#6B2737',
          50: '#F9EEF0',
          100: '#EEDCDE',
          200: '#D9AEB4',
          300: '#C27F88',
          400: '#A85060',
          500: '#6B2737',
          600: '#4A1520',
          700: '#36101A',
          800: '#220B11',
          900: '#0E0508',
        },
        darkblue: {
          DEFAULT: '#1B2A4A',
          50: '#E8EBF2',
          100: '#C5CCE0',
          200: '#97A3C5',
          300: '#697BAA',
          400: '#435890',
          500: '#1B2A4A',
          600: '#142038',
          700: '#0E1628',
          800: '#090E1A',
          900: '#04070D',
        },
        // shadcn/ui CSS variable colors
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        shimmer: 'shimmer 2s infinite',
      },
      backgroundImage: {
        'gradient-navy': 'linear-gradient(135deg, #0A1628 0%, #1E2D50 100%)',
        'gradient-orange': 'linear-gradient(135deg, #FF6B35 0%, #E85020 100%)',
        'gradient-brand': 'linear-gradient(135deg, #1B2A4A 0%, #6B2737 100%)',
        'gradient-oxblood': 'linear-gradient(135deg, #1B2A4A 0%, #6B2737 100%)',
        'gradient-darkblue': 'linear-gradient(135deg, #1B2A4A 0%, #243660 100%)',
      },
      boxShadow: {
        'brand': '0 4px 24px rgba(255, 107, 53, 0.25)',
        'navy': '0 4px 24px rgba(10, 22, 40, 0.25)',
        'oxblood': '0 4px 24px rgba(107, 39, 55, 0.35)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config