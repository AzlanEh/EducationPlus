import crypto from "node:crypto";
import { createAdminInvite, getAllInvites } from "@eduPlus/auth/invite";
import { OTP, User } from "@eduPlus/db";
import { z } from "zod";
import {
	adminProcedure,
	protectedProcedure,
	publicProcedure,
	studentProcedure,
} from "../../index";

// =============================================================================
// Constants
// =============================================================================

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;

// Server-side secret for OTP HMAC (falls back to auth secret if not set)
const OTP_SECRET =
	process.env.OTP_HMAC_SECRET ||
	process.env.BETTER_AUTH_SECRET ||
	"fallback-secret-change-in-production";

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Generates a cryptographically secure OTP
 */
function generateOTP(): string {
	// Use crypto.randomInt for better randomness
	const min = 10 ** (OTP_LENGTH - 1);
	const max = 10 ** OTP_LENGTH - 1;
	return crypto.randomInt(min, max).toString();
}

/**
 * Hashes OTP for secure storage using HMAC-SHA256
 * Using HMAC prevents rainbow table attacks even for 6-digit OTPs
 */
function hashOTP(otp: string): string {
	return crypto.createHmac("sha256", OTP_SECRET).update(otp).digest("hex");
}

/**
 * Verifies OTP using constant-time comparison to prevent timing attacks
 */
function verifyOTPHash(inputOtp: string, storedHash: string): boolean {
	const inputHash = hashOTP(inputOtp);
	try {
		return crypto.timingSafeEqual(
			Buffer.from(inputHash),
			Buffer.from(storedHash),
		);
	} catch {
		// If buffers have different lengths, they're not equal
		return false;
	}
}

/**
 * Gets expiry date for OTP
 */
function getOTPExpiry(): Date {
	return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
}

// =============================================================================
// Auth Router
// =============================================================================

export const authRouter = {
	// ===========================================================================
	// Health Check
	// ===========================================================================

	healthCheck: publicProcedure.handler(() => {
		return { status: "ok", timestamp: new Date().toISOString() };
	}),

	// ===========================================================================
	// OTP Endpoints
	// ===========================================================================

	/**
	 * Send OTP for email verification
	 */
	sendOTP: publicProcedure
		.input(
			z.object({
				email: z.string().email("Invalid email address"),
			}),
		)
		.handler(async ({ input }) => {
			const { email } = input;

			// Generate OTP
			const otp = generateOTP();
			const expiresAt = getOTPExpiry();

			// Delete any existing OTPs for this email (prevent spam)
			await OTP.deleteMany({ identifier: email });

			// Store hashed OTP in database
			await OTP.create({
				_id: crypto.randomUUID(),
				identifier: email,
				otpHash: hashOTP(otp),
				expiresAt,
				purpose: "signup",
			});

			// Log OTP in development only (NEVER in production)
			if (
				process.env.NODE_ENV === "development" &&
				process.env.DEBUG_OTP === "true"
			) {
				console.log(`[Auth] OTP for ${email}: ${otp}`);
			}

			// Send email
			try {
				const { sendEmail, getVerificationEmailHTML } = await import(
					"@eduPlus/auth/email"
				);
				await sendEmail(
					email,
					"Verify your email - EduPlus",
					getVerificationEmailHTML(otp),
				);
			} catch (error) {
				console.error("[Auth] Failed to send OTP email:", error);
				// Don't expose email sending errors to client
			}

			return {
				success: true,
				message: "Verification code sent",
				expiresIn: OTP_EXPIRY_MINUTES * 60, // seconds
			};
		}),

	/**
	 * Verify OTP and mark email as verified (or just validate for signup)
	 */
	verifyOTP: publicProcedure
		.input(
			z.object({
				email: z.string().email("Invalid email address"),
				otp: z.string().length(OTP_LENGTH, `OTP must be ${OTP_LENGTH} digits`),
				purpose: z
					.enum(["signup", "email-verification"])
					.optional()
					.default("email-verification"),
			}),
		)
		.handler(async ({ input }) => {
			const { email, otp, purpose } = input;

			// Find OTP record
			const storedOTP = await OTP.findOne({
				identifier: email,
				expiresAt: { $gt: new Date() },
			});

			if (!storedOTP) {
				return {
					success: false,
					error: "Verification code expired or not found",
				};
			}

			// Get attempts from the document (with type assertion)
			const attempts = (storedOTP as any).attempts ?? 0;

			// Check attempt limit
			if (attempts >= MAX_OTP_ATTEMPTS) {
				await OTP.deleteOne({ _id: storedOTP._id });
				return {
					success: false,
					error: "Too many attempts. Please request a new code.",
				};
			}

			// Increment attempts
			await OTP.updateOne({ _id: storedOTP._id }, { $inc: { attempts: 1 } });

			// Verify OTP hash using constant-time comparison
			if (!verifyOTPHash(otp, storedOTP.otpHash)) {
				const remainingAttempts = MAX_OTP_ATTEMPTS - attempts - 1;
				return {
					success: false,
					error: `Invalid code. ${remainingAttempts} attempts remaining.`,
				};
			}

			// For signup purpose, just validate OTP without requiring user to exist
			if (purpose === "signup") {
				// Clean up used OTP
				await OTP.deleteOne({ _id: storedOTP._id });
				return {
					success: true,
					message: "Email verified successfully",
					verified: true,
				};
			}

			// For email-verification purpose, update existing user
			const updateResult = await User.findOneAndUpdate(
				{ email },
				{ emailVerified: true },
				{ new: true },
			);

			if (!updateResult) {
				return {
					success: false,
					error: "User not found. Please sign up first.",
				};
			}

			// Clean up used OTP
			await OTP.deleteOne({ _id: storedOTP._id });

			return {
				success: true,
				message: "Email verified successfully",
			};
		}),

	// ===========================================================================
	// Admin Invite Endpoints
	// ===========================================================================

	/**
	 * Create an admin invite (admin only)
	 */
	createAdminInvite: adminProcedure
		.input(
			z.object({
				email: z.string().email("Invalid email address"),
			}),
		)
		.handler(async ({ context, input }) => {
			const adminId = context.session?.user?.id;

			if (!adminId) {
				throw new Error("Admin not authenticated");
			}

			const token = await createAdminInvite(input.email, adminId);

			return {
				success: true,
				token,
				message: `Invite created for ${input.email}`,
			};
		}),

	/**
	 * Get all admin invites (admin only)
	 */
	getAdminInvites: adminProcedure.handler(async () => {
		const invites = await getAllInvites();
		return {
			invites,
			total: invites.length,
		};
	}),

	// ===========================================================================
	// Test/Debug Endpoints (Protected)
	// ===========================================================================

	/**
	 * Get current user info (student only)
	 */
	studentData: studentProcedure.handler(({ context }) => {
		return {
			message: "Student data access granted",
			user: context.session?.user,
		};
	}),

	/**
	 * Get current user info (admin only)
	 */
	adminData: adminProcedure.handler(({ context }) => {
		return {
			message: "Admin data access granted",
			user: context.session?.user,
		};
	}),

	/**
	 * Get current user info (any authenticated user)
	 */
	privateData: protectedProcedure.handler(({ context }) => {
		return {
			message: "Authenticated access granted",
			user: context.session?.user,
		};
	}),
};
