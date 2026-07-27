import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
	output: "standalone",
	images: {
		domains: ["bcew-staging.s3.us-east-1.amazonaws.com", "bcew-production.s3.us-east-1.amazonaws.com"],
		remotePatterns: [
			{
				protocol: "https",
				hostname: "bcewonline.com",
				port: "444",
				pathname: "/Portal/**",
			},
		],
	},
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "X-Frame-Options",
						value: "DENY",
					},
					{
						key: "Referrer-Policy",
						value: "strict-origin-when-cross-origin",
					},
					{
						key: "Access-Control-Allow-Private-Network",
						value: "true",
					},
				],
			},
			{
				// Allow proxy responses to be embedded in our own iframe.
				// This overrides the DENY above for the legacy-portal proxy path.
				source: "/api/legacy-portal/:path*",
				headers: [
					{
						key: "X-Frame-Options",
						value: "SAMEORIGIN",
					},
				],
			},
			{
				source: "/sw.js",
				headers: [
					{
						key: "Content-Type",
						value: "application/javascript; charset=utf-8",
					},
					{
						key: "Cache-Control",
						value: "no-cache, no-store, must-revalidate",
					},
					{
						key: "Content-Security-Policy",
						value: "default-src 'self'; script-src 'self'",
					},
				],
			},
		];
	},
};

export default withNextIntl(nextConfig);
