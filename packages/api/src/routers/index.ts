import { createAdminInvite, getAllInvites } from "@eduPlus/auth/invite";
import { createAndSendOTP, verifyUserOTP } from "@eduPlus/auth/otp";
import type { RouterClient } from "@orpc/server";
import { z } from "zod";
import {
	adminProcedure,
	protectedProcedure,
	publicProcedure,
	studentProcedure,
} from "../index";

export const appRouter = {
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

	// Admin-only endpoints
	createAdminInvite: adminProcedure
		.input(z.object({ email: z.string().email() }))
		.handler(async ({ input, context }) => {
			if (!context.session?.user.id) {
				throw new Error("User ID is required");
			}
			const token = await createAdminInvite(
				input.email,
				context.session.user.id,
			);
			return {
				success: true,
				token,
				message: "Invite created successfully",
			};
		}),

	getAdminInvites: adminProcedure.handler(async () => {
		const invites = await getAllInvites();
		return invites;
	}),

	// Student-only endpoints
	studentData: studentProcedure.handler(({ context }) => {
		return {
			message: "Student data",
			user: context.session?.user,
		};
	}),

	// Admin-only endpoints
	adminData: adminProcedure.handler(({ context }) => {
		return {
			message: "Admin data",
			user: context.session?.user,
		};
	}),

	// General protected endpoints
	privateData: protectedProcedure.handler(({ context }) => {
		return {
			message: "This is private",
			user: context.session?.user,
		};
	}),
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
