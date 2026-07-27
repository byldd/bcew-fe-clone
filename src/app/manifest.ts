import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "BCEW - Bucks County Electric Works",
		short_name: "BCEW",
		description: "Bucks County Electric Works - Job Management System",
		start_url: "/",
		display: "standalone",
		background_color: "#ffffff",
		theme_color: "#000000",
		icons: [
			{
				src: "/assets/png/logo.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				src: "/assets/png/logo.png",
				sizes: "512x512",
				type: "image/png",
			},
		],
	};
}
