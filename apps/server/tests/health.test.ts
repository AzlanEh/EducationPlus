import { describe, expect, it } from "vitest";
import { app } from "../src/index";

describe("health", () => {
	it("returns healthy status", async () => {
		const res = await app.request("/health");
		expect(res.status).toBe(200);
		const body = (await res.json()) as { status: string };
		expect(body.status).toBe("healthy");
	});
});
