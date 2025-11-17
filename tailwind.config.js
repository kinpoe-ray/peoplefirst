/** @type {import('tailwindcss').Config} */
module.exports = {
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
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			colors: {
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
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				// Distinctive brand colors - warm exploration theme
				ember: {
					DEFAULT: '#FF6B35',
					light: '#FF8F66',
					dark: '#E55A2B',
					50: '#FFF5F0',
					100: '#FFE5DB',
					500: '#FF6B35',
					600: '#E55A2B',
					900: '#8B2500',
				},
				moss: {
					DEFAULT: '#22C55E',
					light: '#4ADE80',
					dark: '#16A34A',
					50: '#F0FDF4',
					500: '#22C55E',
					600: '#16A34A',
				},
				violet: {
					DEFAULT: '#8B5CF6',
					light: '#A78BFA',
					dark: '#7C3AED',
					50: '#F5F3FF',
					500: '#8B5CF6',
					600: '#7C3AED',
				},
				// Core palette
				void: '#030303',
				charcoal: '#0A0A0A',
				graphite: '#141414',
				slate: '#1F1F1F',
				ivory: '#FAFAFA',
				cream: '#F5F5F0',
				// Text hierarchy
				textPrimary: '#FFFFFF',
				textSecondary: '#A3A3A3',
				textTertiary: '#737373',
				textMuted: '#525252',
				// Legacy support (mapped to new colors)
				pathBlue: {
					DEFAULT: '#8B5CF6',
					light: '#A78BFA',
					dark: '#7C3AED',
				},
				warmOrange: {
					DEFAULT: '#FF6B35',
					light: '#FF8F66',
					dark: '#E55A2B',
				},
				successGreen: '#22C55E',
				warningRed: '#EF4444',
				// Dark theme surfaces
				dark: {
					bg: '#030303',
					surface: '#0A0A0A',
					border: '#1F1F1F',
					text: {
						primary: '#FFFFFF',
						secondary: '#A3A3A3',
						tertiary: '#737373',
					},
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				xl: 'calc(var(--radius) + 4px)',
				'2xl': 'calc(var(--radius) + 8px)',
			},
			boxShadow: {
				'glow-ember': '0 0 30px rgba(255, 107, 53, 0.3)',
				'glow-moss': '0 0 30px rgba(34, 197, 94, 0.3)',
				'glow-violet': '0 0 30px rgba(139, 92, 246, 0.3)',
				'inner-glow': 'inset 0 0 30px rgba(255, 107, 53, 0.1)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: 0 },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: 0 },
				},
				'slide-up': {
					from: { transform: 'translateY(20px)', opacity: 0 },
					to: { transform: 'translateY(0)', opacity: 1 },
				},
				'slide-down': {
					from: { transform: 'translateY(-20px)', opacity: 0 },
					to: { transform: 'translateY(0)', opacity: 1 },
				},
				'scale-in': {
					from: { transform: 'scale(0.95)', opacity: 0 },
					to: { transform: 'scale(1)', opacity: 1 },
				},
				'rotate-gradient': {
					'0%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
					'100%': { backgroundPosition: '0% 50%' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'slide-up': 'slide-up 0.6s ease-out',
				'slide-down': 'slide-down 0.6s ease-out',
				'scale-in': 'scale-in 0.4s ease-out',
				'gradient': 'rotate-gradient 8s ease infinite',
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
}