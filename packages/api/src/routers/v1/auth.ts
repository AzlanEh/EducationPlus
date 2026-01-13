import { getAllInvites } from "@eduPlus/auth/invite";
import { Course } from "@eduPlus/db";
import { z } from "zod";
import {
	adminProcedure,
	protectedProcedure,
	publicProcedure,
	studentProcedure,
} from "../../index";

// Global OTP store for development (NOT for production)
const otpStore = new Map<string, { otp: string; expires: number }>();

export const authRouter = {
	// Health check
	healthCheck: publicProcedure.handler(() => {
		return "OK";
	}),

	// Send OTP for email verification
	sendOTP: publicProcedure
		.input(z.object({ email: z.string() }))
		.handler(async ({ input }) => {
			// Generate OTP
			const otp = Math.floor(100000 + Math.random() * 900000).toString();
			const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

			// Store OTP (in production, use database)
			otpStore.set(input.email, { otp, expires });

			console.log(`🔐 OTP for ${input.email}: ${otp}`);

			// Send email
			const { sendEmail, getVerificationEmailHTML } = await import(
				"@eduPlus/auth/email"
			);
			await sendEmail(
				input.email,
				"Verify your email address",
				getVerificationEmailHTML(otp),
			);

			return { success: true };
		}),

	// Verify OTP
	verifyOTP: publicProcedure
		.input(z.object({ email: z.string(), otp: z.string() }))
		.handler(async ({ input }) => {
			// Check if OTP matches stored value
			const stored = otpStore.get(input.email);
			if (!stored || stored.otp !== input.otp || Date.now() > stored.expires) {
				return { success: false, error: "Invalid or expired OTP" };
			}

			// OTP is valid - in production, mark email as verified in database
			otpStore.delete(input.email); // Clean up
			return { success: true };
		}),

	// Admin invite endpoints
	createAdminInvite: adminProcedure
		.input(z.object({ email: z.string().email() }))
		.handler(async ({ input }) => {
			const course = new Course({
				_id: crypto.randomUUID(),
				...input,
			});
			await course.save();
			return { success: true, course };
		}),

	getAdminInvites: adminProcedure.handler(async () => {
		const invites = await getAllInvites();
		return invites;
	}),

	// Test endpoints
	studentData: studentProcedure.handler(({ context }) => {
		return {
			message: "Student data",
			user: context.session?.user,
		};
	}),

	adminData: adminProcedure.handler(({ context }) => {
		return {
			message: "Admin data",
			user: context.session?.user,
		};
	}),

	privateData: protectedProcedure.handler(({ context }) => {
		return {
			message: "This is private",
			user: context.session?.user,
		};
	}),
};
