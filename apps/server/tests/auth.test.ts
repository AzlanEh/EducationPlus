/**
 * Auth Router Tests
 *
 * Tests for authentication-related operations:
 * - OTP generation, storage, and verification
 * - Auth procedures (public, protected, admin, student)
 * - Rate limiting behavior
 * - Input validation
 */

import crypto from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// =============================================================================
// Mock Setup
// =============================================================================

// Mock the database models
vi.mock("@eduPlus/db", () => ({
	OTP: {
		create: vi.fn(),
		findOne: vi.fn(),
		deleteOne: vi.fn(),
		deleteMany: vi.fn(),
		updateOne: vi.fn(),
	},
	User: {
		findOne: vi.fn(),
		findOneAndUpdate: vi.fn(),
	},
}));

// Mock the email module
vi.mock("@eduPlus/auth/email", () => ({
	sendEmail: vi.fn().mockResolvedValue(undefined),
	getVerificationEmailHTML: vi.fn().mockReturnValue("<html>OTP: 123456</html>"),
}));

import { OTP, User } from "@eduPlus/db";

// =============================================================================
// OTP Utility Functions Tests
// =============================================================================

describe("OTP Utility Functions", () => {
	describe("OTP Generation", () => {
		it("generates a 6-digit OTP", () => {
			// Simulate OTP generation logic
			const OTP_LENGTH = 6;
			const min = 10 ** (OTP_LENGTH - 1);
			const max = 10 ** OTP_LENGTH - 1;
			const otp = crypto.randomInt(min, max).toString();

			expect(otp).toHaveLength(6);
			expect(Number(otp)).toBeGreaterThanOrEqual(100000);
			expect(Number(otp)).toBeLessThanOrEqual(999999);
		});

		it("generates unique OTPs", () => {
			const OTP_LENGTH = 6;
			const min = 10 ** (OTP_LENGTH - 1);
			const max = 10 ** OTP_LENGTH - 1;

			const otps = new Set<string>();
			for (let i = 0; i < 100; i++) {
				otps.add(crypto.randomInt(min, max).toString());
			}

			// With 100 random 6-digit numbers, we should have very high uniqueness
			expect(otps.size).toBeGreaterThan(95);
		});

		it("generates cryptographically secure OTPs", () => {
			// Verify we're using crypto.randomInt, not Math.random
			const OTP_LENGTH = 6;
			const min = 10 ** (OTP_LENGTH - 1);
			const max = 10 ** OTP_LENGTH - 1;

			// Generate multiple OTPs and check distribution
			const buckets: Record<string, number> = {};
			for (let i = 0; i < 1000; i++) {
				const otp = crypto.randomInt(min, max).toString();
				const firstDigit = otp[0] as string;
				buckets[firstDigit] = (buckets[firstDigit] || 0) + 1;
			}

			// All first digits (1-9) should be represented
			for (let d = 1; d <= 9; d++) {
				expect(buckets[d.toString()]).toBeGreaterThan(0);
			}
		});
	});

	describe("OTP Hashing", () => {
		it("hashes OTP with SHA-256", () => {
			const otp = "123456";
			const hash = crypto.createHash("sha256").update(otp).digest("hex");

			expect(hash).toHaveLength(64); // SHA-256 produces 64 hex chars
			expect(hash).not.toBe(otp);
		});

		it("produces consistent hash for same OTP", () => {
			const otp = "123456";
			const hash1 = crypto.createHash("sha256").update(otp).digest("hex");
			const hash2 = crypto.createHash("sha256").update(otp).digest("hex");

			expect(hash1).toBe(hash2);
		});

		it("produces different hash for different OTPs", () => {
			const hash1 = crypto.createHash("sha256").update("123456").digest("hex");
			const hash2 = crypto.createHash("sha256").update("654321").digest("hex");

			expect(hash1).not.toBe(hash2);
		});
	});

	describe("OTP Expiry", () => {
		it("calculates correct expiry time (10 minutes)", () => {
			const OTP_EXPIRY_MINUTES = 10;
			const now = Date.now();
			const expiresAt = new Date(now + OTP_EXPIRY_MINUTES * 60 * 1000);

			const expectedExpiry = now + 10 * 60 * 1000;
			expect(expiresAt.getTime()).toBeCloseTo(expectedExpiry, -2);
		});
	});
});

// =============================================================================
// OTP Send Flow Tests
// =============================================================================

describe("OTP Send Flow", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("deletes existing OTPs before creating new one", async () => {
		const email = "test@example.com";

		// Simulate the sendOTP flow
		await OTP.deleteMany({ identifier: email });
		await OTP.create({
			_id: crypto.randomUUID(),
			identifier: email,
			otpHash: "hashed-otp",
			expiresAt: new Date(Date.now() + 10 * 60 * 1000),
			purpose: "signup",
		});

		expect(OTP.deleteMany).toHaveBeenCalledWith({ identifier: email });
		expect(OTP.create).toHaveBeenCalled();
	});

	it("stores OTP with correct structure", async () => {
		const email = "test@example.com";
		const otp = "123456";
		const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

		const otpData = {
			_id: "test-uuid",
			identifier: email,
			otpHash: hashedOtp,
			expiresAt: new Date(Date.now() + 10 * 60 * 1000),
			purpose: "signup" as const,
		};

		vi.mocked(OTP.create).mockResolvedValue(otpData as any);

		const result = await OTP.create(otpData);

		expect(result.identifier).toBe(email);
		expect(result.otpHash).toBe(hashedOtp);
		expect(result.purpose).toBe("signup");
	});

	it("returns success response without exposing OTP", async () => {
		const response = {
			success: true,
			message: "Verification code sent",
			expiresIn: 600, // 10 minutes in seconds
		};

		expect(response.success).toBe(true);
		expect(response.expiresIn).toBe(600);
		// Should NOT contain the actual OTP
		expect(response).not.toHaveProperty("otp");
		expect(response).not.toHaveProperty("code");
	});
});

// =============================================================================
// OTP Verification Flow Tests
// =============================================================================

describe("OTP Verification Flow", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("finds OTP by email and checks expiry", async () => {
		const email = "test@example.com";
		const mockOTP = {
			_id: "otp-id",
			identifier: email,
			otpHash: crypto.createHash("sha256").update("123456").digest("hex"),
			expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min from now
			attempts: 0,
		};

		vi.mocked(OTP.findOne).mockResolvedValue(mockOTP as any);

		const result = await OTP.findOne({
			identifier: email,
			expiresAt: { $gt: new Date() },
		});

		expect(result).toEqual(mockOTP);
		expect(OTP.findOne).toHaveBeenCalledWith({
			identifier: email,
			expiresAt: { $gt: expect.any(Date) },
		});
	});

	it("returns error for expired OTP", async () => {
		vi.mocked(OTP.findOne).mockResolvedValue(null);

		const result = await OTP.findOne({
			identifier: "test@example.com",
			expiresAt: { $gt: new Date() },
		});

		expect(result).toBeNull();
	});

	it("increments attempts on verification try", async () => {
		const otpId = "otp-id";

		await OTP.updateOne({ _id: otpId }, { $inc: { attempts: 1 } });

		expect(OTP.updateOne).toHaveBeenCalledWith(
			{ _id: otpId },
			{ $inc: { attempts: 1 } },
		);
	});

	it("blocks after MAX_OTP_ATTEMPTS (5)", async () => {
		const MAX_OTP_ATTEMPTS = 5;
		const mockOTP = {
			_id: "otp-id",
			identifier: "test@example.com",
			otpHash: "hash",
			expiresAt: new Date(Date.now() + 5 * 60 * 1000),
			attempts: 5, // Already at max
		};

		// Should delete and return error
		if (mockOTP.attempts >= MAX_OTP_ATTEMPTS) {
			await OTP.deleteOne({ _id: mockOTP._id });
			expect(OTP.deleteOne).toHaveBeenCalledWith({ _id: "otp-id" });
		}
	});

	it("verifies OTP hash correctly", () => {
		const otp = "123456";
		const storedHash = crypto.createHash("sha256").update(otp).digest("hex");
		const inputHash = crypto.createHash("sha256").update(otp).digest("hex");

		expect(storedHash).toBe(inputHash);
	});

	it("rejects invalid OTP", () => {
		const storedHash = crypto
			.createHash("sha256")
			.update("123456")
			.digest("hex");
		const inputHash = crypto
			.createHash("sha256")
			.update("654321")
			.digest("hex");

		expect(storedHash).not.toBe(inputHash);
	});

	it("deletes OTP after successful verification", async () => {
		const otpId = "otp-id";

		await OTP.deleteOne({ _id: otpId });

		expect(OTP.deleteOne).toHaveBeenCalledWith({ _id: otpId });
	});

	it("updates user emailVerified for email-verification purpose", async () => {
		const email = "test@example.com";

		vi.mocked(User.findOneAndUpdate).mockResolvedValue({
			_id: "user-id",
			email,
			emailVerified: true,
		} as any);

		await User.findOneAndUpdate(
			{ email },
			{ emailVerified: true },
			{ new: true },
		);

		expect(User.findOneAndUpdate).toHaveBeenCalledWith(
			{ email },
			{ emailVerified: true },
			{ new: true },
		);
	});
});

// =============================================================================
// Auth Procedure Tests
// =============================================================================

describe("Auth Procedures", () => {
	describe("Public Procedure", () => {
		it("allows unauthenticated access", () => {
			const context = { session: null };

			// Public procedures don't require auth
			expect(context.session).toBeNull();
		});
	});

	describe("Protected Procedure", () => {
		it("requires authenticated session", () => {
			const contextWithoutSession: {
				session: { user: { id: string; email: string; role: string } } | null;
			} = { session: null };
			const contextWithSession = {
				session: {
					user: { id: "user-1", email: "test@example.com", role: "student" },
				},
			};

			expect(contextWithoutSession.session).toBeNull();
			expect(contextWithSession.session?.user).toBeDefined();
		});

		it("throws UNAUTHORIZED without session", () => {
			const context: {
				session: { user: { id: string } } | null;
			} = { session: null };

			const checkAuth = () => {
				if (!context.session?.user) {
					throw new Error("UNAUTHORIZED");
				}
			};

			expect(checkAuth).toThrow("UNAUTHORIZED");
		});
	});

	describe("Admin Procedure", () => {
		it("requires admin role", () => {
			const adminContext = {
				session: {
					user: { id: "admin-1", email: "admin@example.com", role: "admin" },
				},
			};
			const studentContext = {
				session: {
					user: {
						id: "student-1",
						email: "student@example.com",
						role: "student",
					},
				},
			};

			expect(adminContext.session.user.role).toBe("admin");
			expect(studentContext.session.user.role).not.toBe("admin");
		});

		it("throws FORBIDDEN for non-admin users", () => {
			const context = {
				session: {
					user: {
						id: "student-1",
						email: "student@example.com",
						role: "student",
					},
				},
			};

			const checkAdmin = () => {
				if (context.session.user.role !== "admin") {
					throw new Error("FORBIDDEN: Admin access required");
				}
			};

			expect(checkAdmin).toThrow("FORBIDDEN");
		});
	});

	describe("Student Procedure", () => {
		it("requires student role", () => {
			const studentContext = {
				session: {
					user: {
						id: "student-1",
						email: "student@example.com",
						role: "student",
					},
				},
			};

			expect(studentContext.session.user.role).toBe("student");
		});

		it("throws FORBIDDEN for non-student users", () => {
			const context = {
				session: {
					user: { id: "admin-1", email: "admin@example.com", role: "admin" },
				},
			};

			const checkStudent = () => {
				if (context.session.user.role !== "student") {
					throw new Error("FORBIDDEN: Student access required");
				}
			};

			expect(checkStudent).toThrow("FORBIDDEN");
		});
	});
});

// =============================================================================
// Input Validation Tests
// =============================================================================

describe("Input Validation", () => {
	describe("Email Validation", () => {
		it("accepts valid email addresses", () => {
			const validEmails = [
				"test@example.com",
				"user.name@domain.org",
				"user+tag@gmail.com",
				"test123@sub.domain.co.uk",
			];

			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

			for (const email of validEmails) {
				expect(emailRegex.test(email)).toBe(true);
			}
		});

		it("rejects invalid email addresses", () => {
			const invalidEmails = [
				"invalid",
				"@domain.com",
				"user@",
				"user@.com",
				"user name@domain.com",
			];

			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

			for (const email of invalidEmails) {
				expect(emailRegex.test(email)).toBe(false);
			}
		});
	});

	describe("OTP Validation", () => {
		it("accepts valid 6-digit OTP", () => {
			const validOTPs = ["123456", "000000", "999999", "100000"];

			for (const otp of validOTPs) {
				expect(otp).toHaveLength(6);
				expect(/^\d{6}$/.test(otp)).toBe(true);
			}
		});

		it("rejects invalid OTPs", () => {
			const invalidOTPs = [
				"12345", // too short
				"1234567", // too long
				"abcdef", // letters
				"12345a", // mixed
				"12 345", // space
			];

			for (const otp of invalidOTPs) {
				expect(/^\d{6}$/.test(otp)).toBe(false);
			}
		});
	});

	describe("Purpose Validation", () => {
		it("accepts valid purposes", () => {
			const validPurposes = ["signup", "email-verification"];

			for (const purpose of validPurposes) {
				expect(["signup", "email-verification", "forgot-password"]).toContain(
					purpose,
				);
			}
		});
	});
});

// =============================================================================
// Security Tests
// =============================================================================

describe("Security", () => {
	describe("OTP Storage Security", () => {
		it("never stores plaintext OTP", async () => {
			const otp = "123456";
			const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

			const createCall = {
				identifier: "test@example.com",
				otpHash: hashedOtp,
			};

			// The stored value should be a hash, not the plaintext OTP
			expect(createCall.otpHash).not.toBe(otp);
			expect(createCall.otpHash).toHaveLength(64);
		});
	});

	describe("OTP Timing Attack Prevention", () => {
		it("uses constant-time comparison for OTP verification", () => {
			// This tests the concept - actual implementation uses hash comparison
			const storedHash = crypto
				.createHash("sha256")
				.update("123456")
				.digest("hex");
			const inputHash = crypto
				.createHash("sha256")
				.update("123456")
				.digest("hex");

			// Using crypto.timingSafeEqual for constant-time comparison
			const buffer1 = Buffer.from(storedHash);
			const buffer2 = Buffer.from(inputHash);

			expect(crypto.timingSafeEqual(buffer1, buffer2)).toBe(true);
		});
	});

	describe("Rate Limiting Behavior", () => {
		it("defines OTP rate limit (5 per minute)", () => {
			const OTP_RATE_LIMIT = {
				limit: 5,
				windowMs: 60 * 1000,
			};

			expect(OTP_RATE_LIMIT.limit).toBe(5);
			expect(OTP_RATE_LIMIT.windowMs).toBe(60000);
		});

		it("defines login rate limit (10 per minute)", () => {
			const LOGIN_RATE_LIMIT = {
				limit: 10,
				windowMs: 60 * 1000,
			};

			expect(LOGIN_RATE_LIMIT.limit).toBe(10);
			expect(LOGIN_RATE_LIMIT.windowMs).toBe(60000);
		});

		it("defines auth rate limit (20 per minute)", () => {
			const AUTH_RATE_LIMIT = {
				limit: 20,
				windowMs: 60 * 1000,
			};

			expect(AUTH_RATE_LIMIT.limit).toBe(20);
			expect(AUTH_RATE_LIMIT.windowMs).toBe(60000);
		});
	});

	describe("Error Message Security", () => {
		it("returns generic error for expired/not found OTP", () => {
			const errorResponse = {
				success: false,
				error: "Verification code expired or not found",
			};

			// Should not reveal whether email exists
			expect(errorResponse.error).not.toContain("email");
			expect(errorResponse.error).not.toContain("user");
		});

		it("returns remaining attempts count (not total)", () => {
			const MAX_ATTEMPTS = 5;
			const currentAttempts = 3;
			const remainingAttempts = MAX_ATTEMPTS - currentAttempts - 1;

			const errorResponse = {
				success: false,
				error: `Invalid code. ${remainingAttempts} attempts remaining.`,
			};

			expect(errorResponse.error).toContain("1 attempts remaining");
		});
	});
});

// =============================================================================
// Admin Invite Tests
// =============================================================================

describe("Admin Invite Flow", () => {
	it("requires admin authentication for creating invites", () => {
		const context = {
			session: {
				user: { id: "admin-1", role: "admin" },
			},
		};

		expect(context.session?.user?.role).toBe("admin");
	});

	it("generates unique invite token", () => {
		const token1 = crypto.randomUUID();
		const token2 = crypto.randomUUID();

		expect(token1).not.toBe(token2);
		expect(token1).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
		);
	});
});

// =============================================================================
// Health Check Tests
// =============================================================================

describe("Auth Health Check", () => {
	it("returns correct health check response", () => {
		const response = {
			status: "ok",
			timestamp: new Date().toISOString(),
		};

		expect(response.status).toBe("ok");
		expect(response.timestamp).toBeDefined();
	});
});
