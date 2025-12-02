import { getAllInvites } from "@eduPlus/auth/invite";
import { createAndSendOTP, verifyUserOTP } from "@eduPlus/auth/otp";
import { Course } from "@eduPlus/db";
import { z } from "zod";
import {
	adminProcedure,
	protectedProcedure,
	publicProcedure,
	studentProcedure,
} from "../../index";

export const authRouter = {
	// Health check
	healthCheck: publicProcedure.handler(() => {
		return "OK";
	}),

	// Authentication endpoints
	sendOTP: publicProcedure
		.input(z.object({ userId: z.string() }))
		.handler(async ({ input }) => {
			await createAndSendOTP(input.userId);
			return { success: true, message: "OTP sent successfully" };
		}),

	verifyOTP: publicProcedure
		.input(z.object({ userId: z.string(), otp: z.string() }))
		.handler(async ({ input }) => {
			const isValid = await verifyUserOTP(input.userId, input.otp);
			if (!isValid) {
				throw new Error("Invalid or expired OTP");
			}
			return { success: true, message: "Email verified successfully" };
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
