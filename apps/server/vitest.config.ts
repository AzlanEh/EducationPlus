import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		// Set NODE_ENV to test for proper test environment behavior
		// Note: The server won't auto-start since we're using app.request() directly
		env: {
			NODE_ENV: "test",
		},
		coverage: {
			provider: "v8",
			reporter: ["text", "html"],
			thresholds: {
				statements: 80,
				branches: 80,
				functions: 80,
				lines: 80,
			},
		},
	},
});
