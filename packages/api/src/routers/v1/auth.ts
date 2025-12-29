import { getAllInvites } from "@eduPlus/auth/invite";
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
