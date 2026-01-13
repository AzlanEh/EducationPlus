import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [tailwindcss(), tanstackRouter({}), react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	server: {
		port: 3001,
		// Proxy API requests to backend server
		// This allows cookies to work since both client and API are on same origin
		proxy: {
			"/api": {
				target: "http://localhost:3000",
				changeOrigin: true,
				// Preserve cookies
				cookieDomainRewrite: "localhost",
			},
			"/rpc": {
				target: "http://localhost:3000",
				changeOrigin: true,
				cookieDomainRewrite: "localhost",
			},
		},
	},
});
