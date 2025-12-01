import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		coverage: {
			provider: "v8",
			reporter: ["text", "html"],
			statements: 0.8,
			branches: 0.8,
			functions: 0.8,
			lines: 0.8,
		},
	},
});
