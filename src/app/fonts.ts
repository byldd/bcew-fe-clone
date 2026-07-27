import localFont from "next/font/local";
import { Inter } from "next/font/google";
export const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
});
export const nordique = localFont({
	src: [
		{
			path: "../../public/assets/fonts/nordique/Nordique-regular.otf",
			weight: "400",
			style: "normal",
		},
		{
			path: "../../public/assets/fonts/nordique/Nordique-inline.otf",
			weight: "500",
			style: "normal",
		},
		{
			path: "../../public/assets/fonts/nordique/Nordique-semibold.otf",
			weight: "600",
			style: "normal",
		},
		{
			path: "../../public/assets/fonts/nordique/Nordique-bold.otf",
			weight: "700",
			style: "normal",
		},
	],
	display: "swap",
	variable: "--font-nordique",
});

export const tahoma = localFont({
	src: [
		{
			path: "../../public/assets/fonts/tahoma/tahoma.ttf",
			weight: "400",
			style: "normal",
		},
	],
	display: "swap",
	variable: "--font-tahoma",
});
