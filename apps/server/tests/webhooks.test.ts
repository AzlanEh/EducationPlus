/**
 * Bunny Webhook Handler Tests
 *
 * Tests for the webhook endpoint that receives encoding status updates
 * from Bunny Stream.
 */

import * as crypto from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Store the original env value
const ORIGINAL_WEBHOOK_SECRET = process.env.BUNNY_WEBHOOK_SECRET;

// Mock the database models
vi.mock("@eduPlus/db", () => ({
	Video: {
		findOne: vi.fn(),
		findByIdAndUpdate: vi.fn(),
	},
	LiveStream: {
		findOne: vi.fn(),
		findByIdAndUpdate: vi.fn(),
	},
}));

// Import after mocking
import { Video } from "@eduPlus/db";
import { app } from "../src/index";

describe("Bunny Webhook Handler", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset webhook secret to empty for most tests
		delete process.env.BUNNY_WEBHOOK_SECRET;
	});

	afterEach(() => {
		// Restore original webhook secret after each test
		if (ORIGINAL_WEBHOOK_SECRET) {
			process.env.BUNNY_WEBHOOK_SECRET = ORIGINAL_WEBHOOK_SECRET;
		} else {
			delete process.env.BUNNY_WEBHOOK_SECRET;
		}
	});

	describe("GET /webhooks/bunny", () => {
		it("returns health check status", async () => {
			const res = await app.request("/webhooks/bunny");

			expect(res.status).toBe(200);
			const body = (await res.json()) as {
				status: string;
				service: string;
				timestamp: string;
			};
			expect(body.status).toBe("ok");
			expect(body.service).toBe("bunny-webhook");
			expect(body.timestamp).toBeDefined();
		});
	});

	describe("POST /webhooks/bunny", () => {
		it("handles video not found in database gracefully", async () => {
			// Mock Video.findOne to return null (video not found)
			vi.mocked(Video.findOne).mockReturnValue({
				lean: vi.fn().mockResolvedValue(null),
			} as unknown as ReturnType<typeof Video.findOne>);

			const payload = JSON.stringify({
				VideoLibraryId: 12345,
				VideoGuid: "unknown-video-id",
				Status: 4, // ready
			});

			const res = await app.request("/webhooks/bunny", {
				method: "POST",
				body: payload,
				headers: {
					"Content-Type": "application/json",
				},
			});

			expect(res.status).toBe(200);
			const body = (await res.json()) as { success: boolean; message?: string };
			expect(body.success).toBe(true);
			expect(body.message).toBe("Video not found in database");
		});

		it("updates video status to processing", async () => {
			const mockVideo = {
				_id: "test-video-id",
				bunnyVideoId: "test-bunny-id",
				status: "uploading",
			};

			vi.mocked(Video.findOne).mockReturnValue({
				lean: vi.fn().mockResolvedValue(mockVideo),
			} as unknown as ReturnType<typeof Video.findOne>);

			vi.mocked(Video.findByIdAndUpdate).mockResolvedValue(mockVideo);

			const payload = JSON.stringify({
				VideoLibraryId: 12345,
				VideoGuid: "test-bunny-id",
				Status: 2, // processing
			});

			const res = await app.request("/webhooks/bunny", {
				method: "POST",
				body: payload,
				headers: {
					"Content-Type": "application/json",
				},
			});

			expect(res.status).toBe(200);
			const body = (await res.json()) as { success: boolean };
			expect(body.success).toBe(true);

			// Verify the database was updated
			expect(Video.findByIdAndUpdate).toHaveBeenCalledWith(
				"test-video-id",
				expect.objectContaining({
					status: "processing",
				}),
			);
		});

		it("updates video status to error", async () => {
			const mockVideo = {
				_id: "test-video-id",
				bunnyVideoId: "test-bunny-id",
				status: "processing",
			};

			vi.mocked(Video.findOne).mockReturnValue({
				lean: vi.fn().mockResolvedValue(mockVideo),
			} as unknown as ReturnType<typeof Video.findOne>);

			vi.mocked(Video.findByIdAndUpdate).mockResolvedValue(mockVideo);

			const payload = JSON.stringify({
				VideoLibraryId: 12345,
				VideoGuid: "test-bunny-id",
				Status: 5, // error
			});

			const res = await app.request("/webhooks/bunny", {
				method: "POST",
				body: payload,
				headers: {
					"Content-Type": "application/json",
				},
			});

			expect(res.status).toBe(200);
			expect(Video.findByIdAndUpdate).toHaveBeenCalledWith(
				"test-video-id",
				expect.objectContaining({
					status: "error",
				}),
			);
		});

		it("handles invalid JSON gracefully", async () => {
			const res = await app.request("/webhooks/bunny", {
				method: "POST",
				body: "invalid json {",
				headers: {
					"Content-Type": "application/json",
				},
			});

			expect(res.status).toBe(200); // Returns 200 to prevent retries
			const body = (await res.json()) as { success: boolean; error?: string };
			expect(body.success).toBe(false);
			expect(body.error).toBeDefined();
		});

		it("handles database errors gracefully", async () => {
			vi.mocked(Video.findOne).mockReturnValue({
				lean: vi.fn().mockRejectedValue(new Error("Database connection error")),
			} as unknown as ReturnType<typeof Video.findOne>);

			const payload = JSON.stringify({
				VideoLibraryId: 12345,
				VideoGuid: "test-bunny-id",
				Status: 4,
			});

			const res = await app.request("/webhooks/bunny", {
				method: "POST",
				body: payload,
				headers: {
					"Content-Type": "application/json",
				},
			});

			expect(res.status).toBe(200); // Returns 200 to prevent retries
			const body = (await res.json()) as { success: boolean; error?: string };
			expect(body.success).toBe(false);
			expect(body.error).toContain("Database connection error");
		});
	});

	describe("Webhook Signature Verification", () => {
		it("rejects invalid signature when secret is configured", async () => {
			// Set a test secret for this test only
			process.env.BUNNY_WEBHOOK_SECRET = "test-webhook-secret";

			const payload = JSON.stringify({
				VideoLibraryId: 12345,
				VideoGuid: "test-bunny-id",
				Status: 4,
			});

			const res = await app.request("/webhooks/bunny", {
				method: "POST",
				body: payload,
				headers: {
					"Content-Type": "application/json",
					"X-Bunny-Signature": "invalid-signature",
				},
			});

			expect(res.status).toBe(401);
			const body = (await res.json()) as { error: string };
			expect(body.error).toBe("Invalid signature");
		});

		it("accepts valid signature when secret is configured", async () => {
			// Set a test secret for this test only
			const testSecret = "test-webhook-secret-2";
			process.env.BUNNY_WEBHOOK_SECRET = testSecret;

			const mockVideo = {
				_id: "test-video-id",
				bunnyVideoId: "test-bunny-id",
				status: "processing",
			};

			vi.mocked(Video.findOne).mockReturnValue({
				lean: vi.fn().mockResolvedValue(mockVideo),
			} as unknown as ReturnType<typeof Video.findOne>);

			vi.mocked(Video.findByIdAndUpdate).mockResolvedValue(mockVideo);

			const payload = JSON.stringify({
				VideoLibraryId: 12345,
				VideoGuid: "test-bunny-id",
				Status: 2,
			});

			// Generate valid signature
			const signature = crypto
				.createHmac("sha256", testSecret)
				.update(payload)
				.digest("hex");

			const res = await app.request("/webhooks/bunny", {
				method: "POST",
				body: payload,
				headers: {
					"Content-Type": "application/json",
					"X-Bunny-Signature": signature,
				},
			});

			expect(res.status).toBe(200);
			const body = (await res.json()) as { success: boolean };
			expect(body.success).toBe(true);
		});

		it("accepts any signature when secret is not configured", async () => {
			// Ensure no secret is set
			delete process.env.BUNNY_WEBHOOK_SECRET;

			const mockVideo = {
				_id: "test-video-id",
				bunnyVideoId: "test-bunny-id",
				status: "uploading",
			};

			vi.mocked(Video.findOne).mockReturnValue({
				lean: vi.fn().mockResolvedValue(mockVideo),
			} as unknown as ReturnType<typeof Video.findOne>);

			vi.mocked(Video.findByIdAndUpdate).mockResolvedValue(mockVideo);

			const payload = JSON.stringify({
				VideoLibraryId: 12345,
				VideoGuid: "test-bunny-id",
				Status: 2,
			});

			const res = await app.request("/webhooks/bunny", {
				method: "POST",
				body: payload,
				headers: {
					"Content-Type": "application/json",
					"X-Bunny-Signature": "any-random-signature",
				},
			});

			expect(res.status).toBe(200);
			const body = (await res.json()) as { success: boolean };
			expect(body.success).toBe(true);
		});
	});

	describe("Video Ready Status Handling", () => {
		it("fetches and updates metadata when video is ready", async () => {
			// Ensure no secret is set so signature verification passes
			delete process.env.BUNNY_WEBHOOK_SECRET;

			const mockVideo = {
				_id: "test-video-id",
				bunnyVideoId: "test-bunny-id",
				status: "processing",
			};

			vi.mocked(Video.findOne).mockReturnValue({
				lean: vi.fn().mockResolvedValue(mockVideo),
			} as unknown as ReturnType<typeof Video.findOne>);

			vi.mocked(Video.findByIdAndUpdate).mockResolvedValue(mockVideo);

			// Mock fetch for Bunny API call
			const originalFetch = global.fetch;
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () =>
					Promise.resolve({
						guid: "test-bunny-id",
						title: "Test Video",
						length: 300,
						status: 4,
						width: 1920,
						height: 1080,
						framerate: 30,
						storageSize: 50000000,
						availableResolutions: "1080p,720p,480p",
					}),
			});

			const payload = JSON.stringify({
				VideoLibraryId: 12345,
				VideoGuid: "test-bunny-id",
				Status: 4, // ready
			});

			const res = await app.request("/webhooks/bunny", {
				method: "POST",
				body: payload,
				headers: {
					"Content-Type": "application/json",
				},
			});

			// Restore fetch
			global.fetch = originalFetch;

			expect(res.status).toBe(200);

			// When video is ready, the handler should update with metadata
			expect(Video.findByIdAndUpdate).toHaveBeenCalledWith(
				"test-video-id",
				expect.objectContaining({
					status: "ready",
				}),
			);
		});
	});
});

describe("Webhook Payload Status Mapping", () => {
	// These tests verify that the webhook correctly maps Bunny status codes

	beforeEach(() => {
		vi.clearAllMocks();
		// Ensure no secret is set for these tests
		delete process.env.BUNNY_WEBHOOK_SECRET;
	});

	afterEach(() => {
		// Restore original webhook secret
		if (ORIGINAL_WEBHOOK_SECRET) {
			process.env.BUNNY_WEBHOOK_SECRET = ORIGINAL_WEBHOOK_SECRET;
		} else {
			delete process.env.BUNNY_WEBHOOK_SECRET;
		}
	});

	it.each([
		{ bunnyStatus: 0, expectedStatus: "pending" },
		{ bunnyStatus: 1, expectedStatus: "uploading" },
		{ bunnyStatus: 2, expectedStatus: "processing" },
		{ bunnyStatus: 3, expectedStatus: "processing" }, // transcoding also maps to processing
		{ bunnyStatus: 4, expectedStatus: "ready" },
		{ bunnyStatus: 5, expectedStatus: "error" },
	])("maps Bunny status $bunnyStatus to $expectedStatus", async ({
		bunnyStatus,
		expectedStatus,
	}) => {
		const mockVideo = {
			_id: "test-video-id",
			bunnyVideoId: "test-bunny-id",
			status: "pending",
		};

		vi.mocked(Video.findOne).mockReturnValue({
			lean: vi.fn().mockResolvedValue(mockVideo),
		} as unknown as ReturnType<typeof Video.findOne>);

		vi.mocked(Video.findByIdAndUpdate).mockResolvedValue(mockVideo);

		// Mock fetch for ready status (status 4 makes an API call to get metadata)
		const originalFetch = global.fetch;
		if (bunnyStatus === 4) {
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () =>
					Promise.resolve({
						guid: "test-bunny-id",
						title: "Test",
						length: 100,
						status: 4,
						width: 1280,
						height: 720,
						framerate: 30,
						storageSize: 1000,
						availableResolutions: "720p",
					}),
			});
		}

		const payload = JSON.stringify({
			VideoLibraryId: 12345,
			VideoGuid: "test-bunny-id",
			Status: bunnyStatus,
		});

		await app.request("/webhooks/bunny", {
			method: "POST",
			body: payload,
			headers: { "Content-Type": "application/json" },
		});

		// Restore fetch if we mocked it
		if (bunnyStatus === 4) {
			global.fetch = originalFetch;
		}

		expect(Video.findByIdAndUpdate).toHaveBeenCalledWith(
			"test-video-id",
			expect.objectContaining({
				status: expectedStatus,
			}),
		);
	});
});
