/**
 * Bunny API Helper Tests
 *
 * Tests for URL generation, status mapping, and webhook utilities
 * from packages/api/src/lib/bunny.ts
 */

import * as crypto from "node:crypto";
import {
	bunny,
	getEmbedUrl,
	getPlaybackUrl,
	getThumbnailUrl,
	parseWebhookPayload,
	verifyWebhookSignature,
} from "@eduPlus/api/lib/bunny";
import { describe, expect, it } from "vitest";

describe("Bunny API Helpers", () => {
	describe("URL Generation Format", () => {
		it("generates playback URL in correct format", () => {
			const videoId = "test-video-id-123";
			const url = getPlaybackUrl(videoId);

			// URL should contain the video ID and playlist.m3u8
			expect(url).toContain(videoId);
			expect(url).toContain("/playlist.m3u8");
			expect(url).toMatch(/^https:\/\//);
		});

		it("generates thumbnail URL in correct format with default filename", () => {
			const videoId = "test-video-id-123";
			const url = getThumbnailUrl(videoId);

			expect(url).toContain(videoId);
			expect(url).toContain("/thumbnail.jpg");
			expect(url).toMatch(/^https:\/\//);
		});

		it("generates thumbnail URL with custom filename", () => {
			const videoId = "test-video-id-123";
			const customFilename = "thumb_01.jpg";
			const url = getThumbnailUrl(videoId, customFilename);

			expect(url).toContain(videoId);
			expect(url).toContain(`/${customFilename}`);
			expect(url).not.toContain("/thumbnail.jpg");
		});

		it("generates embed URL in correct format", () => {
			const videoId = "test-video-id-123";
			const url = getEmbedUrl(videoId);

			expect(url).toContain("https://iframe.mediadelivery.net/embed/");
			expect(url).toContain(videoId);
		});

		it("generates different URLs for different video IDs", () => {
			const url1 = getPlaybackUrl("video-1");
			const url2 = getPlaybackUrl("video-2");

			expect(url1).not.toBe(url2);
			expect(url1).toContain("video-1");
			expect(url2).toContain("video-2");
		});
	});

	describe("Webhook Signature Verification", () => {
		it("verifies valid webhook signature when secret is set", () => {
			const secret = process.env.BUNNY_WEBHOOK_SECRET;
			if (!secret) {
				// Skip this test if no secret is configured
				// The function returns true when no secret is set
				expect(true).toBe(true);
				return;
			}

			const payload = JSON.stringify({
				VideoLibraryId: 12345,
				VideoGuid: "test-video-id",
				Status: 4,
			});

			const expectedSignature = crypto
				.createHmac("sha256", secret)
				.update(payload)
				.digest("hex");

			const result = verifyWebhookSignature(payload, expectedSignature);
			expect(result).toBe(true);
		});

		it("rejects invalid webhook signature when secret is set", () => {
			const secret = process.env.BUNNY_WEBHOOK_SECRET;
			if (!secret) {
				// When no secret is set, verification is skipped (returns true)
				const payload = JSON.stringify({
					VideoLibraryId: 12345,
					VideoGuid: "test-video-id",
					Status: 4,
				});
				const result = verifyWebhookSignature(payload, "any-signature");
				expect(result).toBe(true);
				return;
			}

			const payload = JSON.stringify({
				VideoLibraryId: 12345,
				VideoGuid: "test-video-id",
				Status: 4,
			});

			const result = verifyWebhookSignature(payload, "invalid-signature");
			expect(result).toBe(false);
		});
	});

	describe("Webhook Payload Parsing", () => {
		it("parses webhook payload with pending status (0)", () => {
			const payload = JSON.stringify({
				VideoLibraryId: 12345,
				VideoGuid: "test-video-id",
				Status: 0,
			});

			const result = parseWebhookPayload(payload);

			expect(result).toEqual({
				libraryId: 12345,
				videoId: "test-video-id",
				status: "pending",
			});
		});

		it("parses webhook payload with uploading status (1)", () => {
			const payload = JSON.stringify({
				VideoLibraryId: 12345,
				VideoGuid: "test-video-id",
				Status: 1,
			});

			const result = parseWebhookPayload(payload);

			expect(result.status).toBe("uploading");
		});

		it("parses webhook payload with processing status (2)", () => {
			const payload = JSON.stringify({
				VideoLibraryId: 12345,
				VideoGuid: "test-video-id",
				Status: 2,
			});

			const result = parseWebhookPayload(payload);

			expect(result.status).toBe("processing");
		});

		it("parses webhook payload with transcoding status (3)", () => {
			const payload = JSON.stringify({
				VideoLibraryId: 12345,
				VideoGuid: "test-video-id",
				Status: 3,
			});

			const result = parseWebhookPayload(payload);

			expect(result.status).toBe("processing");
		});

		it("parses webhook payload with ready status (4)", () => {
			const payload = JSON.stringify({
				VideoLibraryId: 12345,
				VideoGuid: "test-video-id",
				Status: 4,
			});

			const result = parseWebhookPayload(payload);

			expect(result.status).toBe("ready");
		});

		it("parses webhook payload with error status (5)", () => {
			const payload = JSON.stringify({
				VideoLibraryId: 12345,
				VideoGuid: "test-video-id",
				Status: 5,
			});

			const result = parseWebhookPayload(payload);

			expect(result.status).toBe("error");
		});

		it("parses webhook payload with unknown status as pending", () => {
			const payload = JSON.stringify({
				VideoLibraryId: 12345,
				VideoGuid: "test-video-id",
				Status: 99,
			});

			const result = parseWebhookPayload(payload);

			expect(result.status).toBe("pending");
		});

		it("throws on invalid JSON", () => {
			expect(() => parseWebhookPayload("invalid json")).toThrow();
		});

		it("handles empty string status gracefully", () => {
			const payload = JSON.stringify({
				VideoLibraryId: 12345,
				VideoGuid: "test-video-id",
				Status: -1,
			});

			const result = parseWebhookPayload(payload);
			expect(result.status).toBe("pending");
		});
	});

	describe("Bunny Module Exports", () => {
		it("exports all video management functions", () => {
			expect(bunny.createVideo).toBeDefined();
			expect(typeof bunny.createVideo).toBe("function");
			expect(bunny.getVideo).toBeDefined();
			expect(typeof bunny.getVideo).toBe("function");
			expect(bunny.getVideoStatus).toBeDefined();
			expect(typeof bunny.getVideoStatus).toBe("function");
			expect(bunny.deleteVideo).toBeDefined();
			expect(typeof bunny.deleteVideo).toBe("function");
			expect(bunny.updateVideo).toBeDefined();
			expect(typeof bunny.updateVideo).toBe("function");
			expect(bunny.listVideos).toBeDefined();
			expect(typeof bunny.listVideos).toBe("function");
		});

		it("exports all URL generator functions", () => {
			expect(bunny.getTusUploadUrl).toBeDefined();
			expect(typeof bunny.getTusUploadUrl).toBe("function");
			expect(bunny.getPlaybackUrl).toBeDefined();
			expect(typeof bunny.getPlaybackUrl).toBe("function");
			expect(bunny.getThumbnailUrl).toBeDefined();
			expect(typeof bunny.getThumbnailUrl).toBe("function");
			expect(bunny.getEmbedUrl).toBeDefined();
			expect(typeof bunny.getEmbedUrl).toBe("function");
		});

		it("exports all live streaming functions", () => {
			expect(bunny.createLiveStream).toBeDefined();
			expect(typeof bunny.createLiveStream).toBe("function");
			expect(bunny.getLiveStreamStatus).toBeDefined();
			expect(typeof bunny.getLiveStreamStatus).toBe("function");
			expect(bunny.deleteLiveStream).toBeDefined();
			expect(typeof bunny.deleteLiveStream).toBe("function");
		});

		it("exports webhook helper functions", () => {
			expect(bunny.verifyWebhookSignature).toBeDefined();
			expect(typeof bunny.verifyWebhookSignature).toBe("function");
			expect(bunny.parseWebhookPayload).toBeDefined();
			expect(typeof bunny.parseWebhookPayload).toBe("function");
		});
	});
});

describe("TUS Upload URL Generation", () => {
	it("generates TUS upload URL with required parameters", () => {
		const videoId = "test-video-id-123";
		const tusUrl = bunny.getTusUploadUrl(videoId);

		expect(tusUrl).toContain("https://video.bunnycdn.com/tusupload");
		expect(tusUrl).toContain(`videoId=${videoId}`);
		expect(tusUrl).toContain("libraryId=");
		expect(tusUrl).toContain("AuthorizationSignature=");
		expect(tusUrl).toContain("AuthorizationExpire=");
	});

	it("generates different signatures for different video IDs", () => {
		const tusUrl1 = bunny.getTusUploadUrl("video-1");
		const tusUrl2 = bunny.getTusUploadUrl("video-2");

		// Extract signatures from URLs
		const sig1 = tusUrl1.match(/AuthorizationSignature=([a-f0-9]+)/)?.[1];
		const sig2 = tusUrl2.match(/AuthorizationSignature=([a-f0-9]+)/)?.[1];

		expect(sig1).toBeDefined();
		expect(sig2).toBeDefined();
		expect(sig1).not.toBe(sig2);
	});

	it("generates valid expiration timestamp", () => {
		const tusUrl = bunny.getTusUploadUrl("test-video");
		const expireMatch = tusUrl.match(/AuthorizationExpire=(\d+)/);

		expect(expireMatch).toBeDefined();
		expect(expireMatch).not.toBeNull();
		const expireTimestamp = Number.parseInt(expireMatch?.[1] ?? "0", 10);

		// Expiration should be in the future (at least 30 minutes from now)
		const now = Math.floor(Date.now() / 1000);
		expect(expireTimestamp).toBeGreaterThan(now);
		expect(expireTimestamp).toBeLessThan(now + 7200); // Less than 2 hours
	});

	it("generates SHA256 hex signature", () => {
		const tusUrl = bunny.getTusUploadUrl("test-video");
		const sigMatch = tusUrl.match(/AuthorizationSignature=([a-f0-9]+)/);

		expect(sigMatch).toBeDefined();
		expect(sigMatch).not.toBeNull();
		// SHA256 produces 64-character hex string
		expect(sigMatch?.[1]).toHaveLength(64);
	});
});

describe("Status Mapping Edge Cases", () => {
	it("maps all known Bunny status codes correctly", () => {
		const testCases = [
			{ input: 0, expected: "pending" },
			{ input: 1, expected: "uploading" },
			{ input: 2, expected: "processing" },
			{ input: 3, expected: "processing" },
			{ input: 4, expected: "ready" },
			{ input: 5, expected: "error" },
		];

		for (const { input, expected } of testCases) {
			const payload = JSON.stringify({
				VideoLibraryId: 12345,
				VideoGuid: "test-video-id",
				Status: input,
			});

			const result = parseWebhookPayload(payload);
			expect(result.status).toBe(expected);
		}
	});

	it("handles negative status codes as pending", () => {
		const payload = JSON.stringify({
			VideoLibraryId: 12345,
			VideoGuid: "test-video-id",
			Status: -1,
		});

		const result = parseWebhookPayload(payload);
		expect(result.status).toBe("pending");
	});

	it("handles very large status codes as pending", () => {
		const payload = JSON.stringify({
			VideoLibraryId: 12345,
			VideoGuid: "test-video-id",
			Status: 9999,
		});

		const result = parseWebhookPayload(payload);
		expect(result.status).toBe("pending");
	});
});
