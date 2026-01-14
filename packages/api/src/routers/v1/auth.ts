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
 * Hashes OTP for secure storage using SHA-256
 */
function hashOTP(otp: string): string {
	return crypto.createHash("sha256").update(otp).digest("hex");
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

			// Log OTP in development (remove in production)
			if (process.env.NODE_ENV === "development") {
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

			// Verify OTP hash
			if (storedOTP.otpHash !== hashOTP(otp)) {
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
