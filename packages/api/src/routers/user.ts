import { User } from "@eduPlus/db";
import { z } from "zod";
import { adminProcedure } from "../index";

export const userRouter = {
	// User management endpoints
	getUsers: adminProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).default(50),
				offset: z.number().min(0).default(0),
				role: z.enum(["student", "admin"]).optional(),
			}),
		)
		.handler(async ({ input }) => {
			const { limit, offset, role } = input;
			const filter: Record<string, unknown> = {};
			if (role) {
				filter.role = role;
			}
			const users = await User.find(filter)
				.sort({ createdAt: -1 })
				.limit(limit)
				.skip(offset)
				.lean();
			const total = await User.countDocuments(filter);
			return { users, total };
		}),

	getUser: adminProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input }) => {
			const user = await User.findById(input.id).lean();
			if (!user) {
				throw new Error("User not found");
			}
			return user;
		}),

	updateUser: adminProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().min(1).optional(),
				email: z.string().email().optional(),
				role: z.enum(["student", "admin"]).optional(),
				target: z.string().optional(),
				gender: z.enum(["male", "female", "other"]).optional(),
				phoneNo: z.string().optional(),
			}),
		)
		.handler(async ({ input }) => {
			const { id, ...updateData } = input;
			const user = await User.findByIdAndUpdate(id, updateData, {
				new: true,
			}).lean();
			if (!user) {
				throw new Error("User not found");
			}
			return { success: true, user };
		}),

	deleteUser: adminProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input }) => {
			const user = await User.findByIdAndDelete(input.id);
			if (!user) {
				throw new Error("User not found");
			}
			return { success: true };
		}),
};
