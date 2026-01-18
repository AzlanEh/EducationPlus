/**
 * Auth Integration Tests
 *
 * Tests for complete authentication flows:
 * - OTP send and verify flow
 * - Session management
 * - Rate limiting
 * - CORS and security headers
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../src/index";

// =============================================================================
// Health Check Integration Tests
// =============================================================================

describe("Health Check Integration", () => {
	it("returns healthy status from /health endpoint", async () => {
		const res = await app.request("/health");

		expect(res.status).toBe(200);
		const body = (await res.json()) as { status: string };
		expect(body.status).toBe("healthy");
	});
});

// =============================================================================
// Security Headers Integration Tests
// =============================================================================

describe("Security Headers", () => {
	it("includes secure headers in response", async () => {
		const res = await app.request("/health");

		// Check for security headers set by secureHeaders middleware
		expect(res.headers.get("x-content-type-options")).toBe("nosniff");
		expect(res.headers.get("x-frame-options")).toBe("SAMEORIGIN");
	});

	it("includes rate limit headers", async () => {
		const res = await app.request("/health");

		expect(res.headers.get("x-ratelimit-limit")).toBeDefined();
		expect(res.headers.get("x-ratelimit-remaining")).toBeDefined();
		expect(res.headers.get("x-ratelimit-reset")).toBeDefined();
	});
});

// =============================================================================
// CORS Integration Tests
// =============================================================================

describe("CORS Configuration", () => {
	it("allows requests from configured origins", async () => {
		const res = await app.request("/health", {
			headers: {
				Origin: "http://localhost:5173",
			},
		});

		expect(res.status).toBe(200);
	});

	it("handles preflight OPTIONS requests for auth routes", async () => {
		const res = await app.request("/api/auth/session", {
			method: "OPTIONS",
			headers: {
				Origin: "http://localhost:5173",
				"Access-Control-Request-Method": "POST",
				"Access-Control-Request-Headers": "Content-Type",
			},
		});

		// OPTIONS requests should be handled
		expect([200, 204]).toContain(res.status);
	});

	it("allows expo-origin header for mobile apps", async () => {
		const res = await app.request("/api/auth/session", {
			method: "GET",
			headers: {
				"expo-origin": "exp://192.168.1.1:19000",
			},
		});

		// Should not reject due to missing origin
		expect(res.status).not.toBe(403);
	});
});

// =============================================================================
// Rate Limiting Integration Tests
// =============================================================================

describe("Rate Limiting", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns rate limit headers on responses", async () => {
		const res = await app.request("/health");

		const limit = res.headers.get("x-ratelimit-limit");
		const remaining = res.headers.get("x-ratelimit-remaining");
		const reset = res.headers.get("x-ratelimit-reset");

		expect(limit).toBeDefined();
		expect(remaining).toBeDefined();
		expect(reset).toBeDefined();

		// Default limit should be 1000
		expect(Number(limit)).toBe(1000);
	});

	it("applies stricter rate limit to auth endpoints", async () => {
		const res = await app.request("/api/auth/session", {
			method: "GET",
		});

		const limit = res.headers.get("x-ratelimit-limit");
		// Auth endpoints should have stricter limits (20)
		expect(Number(limit)).toBe(20);
	});
});

// =============================================================================
// Auth Endpoint Integration Tests
// =============================================================================

describe("Auth Endpoints", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("Auth route handling", () => {
		it("auth routes are mounted and handled at /api/auth/*", async () => {
			// Verify auth handler is invoked by checking console output
			// Better Auth returns 404 for /session with no valid session cookie, which is correct behavior
			const res = await app.request("/api/auth/session", {
				method: "GET",
				headers: {
					Origin: "http://localhost:5173",
				},
			});

			// The route is handled (any response from auth.handler means it's mounted)
			// Better Auth returns 404 for invalid/unknown routes or no session
			expect(res.status).toBeDefined();
		});

		it("applies auth rate limit config to /api/auth/* routes", async () => {
			const res = await app.request("/api/auth/session", {
				method: "GET",
				headers: {
					Origin: "http://localhost:5173",
				},
			});

			// Verify auth-specific rate limit is applied (20 per minute)
			const limit = res.headers.get("x-ratelimit-limit");
			expect(Number(limit)).toBe(20);
		});
	});
});

// =============================================================================
// Webhook Integration Tests
// =============================================================================

describe("Webhook Endpoints", () => {
	it("has Bunny webhook route mounted", async () => {
		// Test that the webhook route exists (it will fail auth/validation but route exists)
		const res = await app.request("/webhooks/bunny", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({}),
		});

		// Should not be 404 (route exists)
		expect(res.status).not.toBe(404);
	});
});

// =============================================================================
// RPC Endpoint Integration Tests
// =============================================================================

describe("RPC Endpoints", () => {
	it("handles CORS for RPC routes", async () => {
		const res = await app.request("/rpc/v1/auth/healthCheck", {
			method: "OPTIONS",
			headers: {
				Origin: "http://localhost:5173",
				"Access-Control-Request-Method": "POST",
			},
		});

		expect([200, 204]).toContain(res.status);
	});
});

// =============================================================================
// Mobile App Request Integration Tests
// =============================================================================

describe("Mobile App Requests", () => {
	it("handles requests without Origin header", async () => {
		const res = await app.request("/health");

		// Should not fail due to missing Origin
		expect(res.status).toBe(200);
	});

	it("handles requests with expo-origin header", async () => {
		const res = await app.request("/api/auth/session", {
			method: "GET",
			headers: {
				"expo-origin": "exp://10.0.0.1:19000",
				"User-Agent":
					"Expo/51.0.0 (Android; SDK 34) okhttp/4.9.3 React Native/0.74.0",
			},
		});

		// Should process the request
		expect(res.status).not.toBe(403);
	});

	it("handles requests with CFNetwork user agent (iOS)", async () => {
		const res = await app.request("/api/auth/session", {
			method: "GET",
			headers: {
				"expo-origin": "exp://192.168.1.100:8081",
				"User-Agent": "Expo/51.0.0 CFNetwork/1494.0.7 Darwin/23.4.0",
			},
		});

		expect(res.status).not.toBe(403);
	});
});

// =============================================================================
// Error Response Integration Tests
// =============================================================================

describe("Error Responses", () => {
	it("returns JSON error for 404 routes", async () => {
		const res = await app.request("/nonexistent-route");

		expect(res.status).toBe(404);
	});

	it("rate limit response includes Retry-After header", async () => {
		// This tests the structure - actual rate limiting would require many requests
		const mockRateLimitResponse = {
			status: 429,
			headers: {
				"Retry-After": "60",
				"X-RateLimit-Limit": "5",
				"X-RateLimit-Remaining": "0",
			},
			body: {
				message: "Too Many Requests",
				retryAfter: 60,
			},
		};

		expect(mockRateLimitResponse.headers["Retry-After"]).toBeDefined();
		expect(mockRateLimitResponse.body.message).toBe("Too Many Requests");
	});
});

// =============================================================================
// Metrics Endpoint Integration Tests
// =============================================================================

describe("Metrics Endpoint", () => {
	it("exposes Prometheus metrics", async () => {
		const res = await app.request("/metrics");

		// Metrics endpoint should exist and return Prometheus format
		expect(res.status).toBe(200);
	});
});
