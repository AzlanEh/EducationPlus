import { handle } from "@hono/node-server/vercel";

console.log("Initializing Vercel API handler...");

let app: any;

try {
	// @ts-ignore - Importing from build artifact
	const module = await import("../dist/index.js");
	app = module.app;
	console.log("Successfully loaded app from dist/index.js");
} catch (error) {
	console.error("Failed to load app:", error);
	throw error;
}

export const config = {
	runtime: "nodejs",
};

export default handle(app);
