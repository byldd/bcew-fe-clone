import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: ["./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			screens: {
				"3xl": "3921px",
			},
			colors: {
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				chart: {
					"1": "hsl(var(--chart-1))",
					"2": "hsl(var(--chart-2))",
					"3": "hsl(var(--chart-3))",
					"4": "hsl(var(--chart-4))",
					"5": "hsl(var(--chart-5))",
				},
				sidebar: {
					DEFAULT: "hsl(var(--sidebar-bg))",
					foreground: "hsl(var(--sidebar-foreground))",
					primary: "hsl(var(--sidebar-primary))",
					"primary-foreground": "hsl(var(--sidebar-primary-foreground))",
					accent: "hsl(var(--sidebar-accent))",
					"accent-foreground": "hsl(var(--sidebar-accent-foreground))",
					border: "hsl(var(--sidebar-border))",
					ring: "hsl(var(--sidebar-ring))",
				},
				brand: {
					gray: "#D5D5D5",
					green: "#62CD32",
					border: "#C2C2C2",
					black: "#2B2B2B",
					black50: "#212121",
					dark: "#151515",
					dark80: "#151515CC",
					dark60: "rgba(21,21,21,0.6)",
					dark50: "rgba(21,21,21,0.5)",
					dark10: "rgba(21,21,21,0.1)",
					dark30: "#1515154D",
					grey: "#666666",
					red: "#D50D0D",
					red01: "#F01D1D",
					lightred: "#C84D00",
					lightgrey: "#999999",
					bgLightgrey04: "1515150A",
					bgLightgrey50: "#FAFAFA",
					bgLightgrey: "#F5F5F5",
					greenAccent: "#0CC312",
					copper: "#B87333",
					silver: "#E8E8E8",
					green10: "#008236",
					greenLight: "#B9F8CF",
					green800: "#49B518",
					bgLightgreen: "#F0FDF4",
					green100: "#e0f5d6",
					red800: "#F01D1D",
					red100: "#fee2e2",
					yellow600: "#937823",
					yellow800: "#7A6113",
					bgYellow: "#F7F3D8",
					lightyellow: "#9378231A",
					bgLightyellow: "#FFEDD4",
					greyLight: "#94A3B8",
				},
				green: {
					"100": "#E0F5D6",
					"400": "#62CD32",
					"600": "#418921",
					"700": "#316619",
				},
				grey: {
					"50": "#FDFDFD",
					"100": "#F9F9F9",
					"200": "#7C7C7C",
					"300": "#4E4E4E",
					"400": "#DEE1E6",
					"500": "#A6A6A6",
					"600": "#565E6D",
					"700": "#2B2B2B",
				},
				zblack: {
					"400": "#424956",
					"500": "#171A1F",
					"600": "#000000",
				},
				purple: {
					"800": "#5c5ec8",
				},
			},
			fontFamily: {
				nordique: ["var(--font-nordique)", "system-ui", "sans-serif"],
				tahoma: ["var(--font-tahoma)", "sans-serif"],
				inter: ["var(--font-inter)", "Inter", "sans-serif"],
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			keyframes: {
				"accordion-down": {
					from: {
						height: "0",
					},
					to: {
						height: "var(--radix-accordion-content-height)",
					},
				},
				"accordion-up": {
					from: {
						height: "var(--radix-accordion-content-height)",
					},
					to: {
						height: "0",
					},
				},
				"scan-line": {
					"0%, 100%": { top: "0%" },
					"50%": { top: "100%" },
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				"scan-line": "scan-line 2.2s ease-in-out infinite",
			},
		},
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
