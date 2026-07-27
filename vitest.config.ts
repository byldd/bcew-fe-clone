import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
	test: {
		// jsdom if you later test React components
		environment: "node",
		globals: true,
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
			"@public": path.resolve(__dirname, "public"),
			"@common": path.resolve(__dirname, "src/components/common"),
			"@account": path.resolve(__dirname, "src/module/profile/templates"),
		},
	},
});
