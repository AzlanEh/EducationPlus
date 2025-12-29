import { Module } from "@eduPlus/db";
import { z } from "zod";
import { adminProcedure } from "../index";

export const moduleRouter = {
	createModule: adminProcedure
		.input(
			z.object({
				title: z.string().min(1),
				description: z.string().optional(),
				courseId: z.string().min(1),
				order: z.number().default(0),
				isPublished: z.boolean().default(false),
			}),
		)
		.handler(async ({ input }) => {
			const module = new Module({
				_id: crypto.randomUUID(),
				...input,
			});
			await module.save();
			return { success: true, module };
		}),

	getModules: adminProcedure
		.input(
			z.object({
				courseId: z.string().min(1).optional(),
				limit: z.number().min(1).max(100).default(50),
				offset: z.number().min(0).default(0),
				isPublished: z.boolean().optional(),
			}),
		)
		.handler(async ({ input }) => {
			const { courseId, limit, offset, isPublished } = input;
			const filter: Record<string, unknown> = {};
			if (courseId) {
				filter.courseId = courseId;
			}
			if (isPublished !== undefined) {
				filter.isPublished = isPublished;
			}
			const modules = await Module.find(filter)
				.sort({ order: 1, createdAt: -1 })
				.limit(limit)
				.skip(offset)
				.lean();
			const total = await Module.countDocuments(filter);
			return { modules, total };
		}),

	getModule: adminProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input }) => {
			const module = await Module.findById(input.id).lean();
			if (!module) {
				throw new Error("Module not found");
			}
			return module;
		}),

	updateModule: adminProcedure
		.input(
			z.object({
				id: z.string(),
				title: z.string().min(1).optional(),
				description: z.string().optional(),
				courseId: z.string().min(1).optional(),
				order: z.number().optional(),
				isPublished: z.boolean().optional(),
			}),
		)
		.handler(async ({ input }) => {
			const { id, ...updateData } = input;
			const module = await Module.findByIdAndUpdate(id, updateData, {
				new: true,
			}).lean();
			if (!module) {
				throw new Error("Module not found");
			}
			return { success: true, module };
		}),

	deleteModule: adminProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input }) => {
			const module = await Module.findByIdAndDelete(input.id);
			if (!module) {
				throw new Error("Module not found");
			}
			// Also delete related videos, notes, and DPPs if module is deleted
			await Promise.all([
				// Note: Consider if these should be soft deletes or moved to a "no module" state
				// For now, hard delete to match course deletion behavior
				Module.deleteMany({ moduleId: input.id }), // if modules can be nested
				// Video.updateMany({ moduleId: input.id }, { moduleId: null }), // or delete them
				// Note.updateMany({ moduleId: input.id }, { moduleId: null }),
				// DPP.updateMany({ moduleId: input.id }, { moduleId: null }),
			]);
			return { success: true };
		}),
};
