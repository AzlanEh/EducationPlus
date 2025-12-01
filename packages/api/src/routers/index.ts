import { getAllInvites } from "@eduPlus/auth/invite";
import { createAndSendOTP, verifyUserOTP } from "@eduPlus/auth/otp";
import { Course, DPP, Note, Video } from "@eduPlus/db";
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

	// Course CRUD endpoints
	createCourse: adminProcedure
		.input(
			z.object({
				title: z.string().min(1),
				description: z.string().min(1),
				thumbnail: z.string().optional(),
				subject: z.string().min(1),
				target: z.string().min(1),
				level: z.enum(["beginner", "intermediate", "advanced"]),
				instructor: z.string().min(1),
				isPublished: z.boolean().default(false),
			}),
		)
		.handler(async ({ input }) => {
			const course = new Course({
				_id: crypto.randomUUID(),
				...input,
			});
			await course.save();
			return { success: true, course };
		}),

	getCourses: adminProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).default(50),
				offset: z.number().min(0).default(0),
				isPublished: z.boolean().optional(),
			}),
		)
		.handler(async ({ input }) => {
			const { limit, offset, isPublished } = input;
			const filter: Record<string, unknown> = {};
			if (isPublished !== undefined) {
				filter.isPublished = isPublished;
			}
			const courses = await Course.find(filter)
				.sort({ createdAt: -1 })
				.limit(limit)
				.skip(offset)
				.lean();
			const total = await Course.countDocuments(filter);
			return { courses, total };
		}),

	getCourse: adminProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input }) => {
			const course = await Course.findById(input.id).lean();
			if (!course) {
				throw new Error("Course not found");
			}
			return course;
		}),

	updateCourse: adminProcedure
		.input(
			z.object({
				id: z.string(),
				title: z.string().min(1).optional(),
				description: z.string().min(1).optional(),
				thumbnail: z.string().optional(),
				subject: z.string().min(1).optional(),
				target: z.string().min(1).optional(),
				level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
				instructor: z.string().min(1).optional(),
				isPublished: z.boolean().optional(),
			}),
		)
		.handler(async ({ input }) => {
			const { id, ...updateData } = input;
			const course = await Course.findByIdAndUpdate(id, updateData, {
				new: true,
			}).lean();
			if (!course) {
				throw new Error("Course not found");
			}
			return { success: true, course };
		}),

	deleteCourse: adminProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input }) => {
			const course = await Course.findByIdAndDelete(input.id);
			if (!course) {
				throw new Error("Course not found");
			}
			// Also delete related videos, notes, and DPPs
			await Promise.all([
				Video.deleteMany({ courseId: input.id }),
				Note.deleteMany({ courseId: input.id }),
				DPP.deleteMany({ courseId: input.id }),
			]);
			return { success: true };
		}),

	// Video CRUD endpoints
	createVideo: adminProcedure
		.input(
			z.object({
				title: z.string().min(1),
				description: z.string().optional(),
				youtubeVideoId: z.string().min(1),
				duration: z.number().optional(),
				courseId: z.string().min(1),
				moduleId: z.string().optional(),
				order: z.number().default(0),
				isPublished: z.boolean().default(false),
			}),
		)
		.handler(async ({ input }) => {
			const video = new Video({
				_id: crypto.randomUUID(),
				...input,
			});
			await video.save();
			return { success: true, video };
		}),

	getVideos: adminProcedure
		.input(
			z.object({
				courseId: z.string().optional(),
				limit: z.number().min(1).max(100).default(50),
				offset: z.number().min(0).default(0),
			}),
		)
		.handler(async ({ input }) => {
			const { courseId, limit, offset } = input;
			const filter: Record<string, unknown> = {};
			if (courseId) {
				filter.courseId = courseId;
			}
			const videos = await Video.find(filter)
				.sort({ order: 1, createdAt: -1 })
				.limit(limit)
				.skip(offset)
				.lean();
			const total = await Video.countDocuments(filter);
			return { videos, total };
		}),

	updateVideo: adminProcedure
		.input(
			z.object({
				id: z.string(),
				title: z.string().min(1).optional(),
				description: z.string().optional(),
				youtubeVideoId: z.string().min(1).optional(),
				duration: z.number().optional(),
				courseId: z.string().min(1).optional(),
				moduleId: z.string().optional(),
				order: z.number().optional(),
				isPublished: z.boolean().optional(),
			}),
		)
		.handler(async ({ input }) => {
			const { id, ...updateData } = input;
			const video = await Video.findByIdAndUpdate(id, updateData, {
				new: true,
			}).lean();
			if (!video) {
				throw new Error("Video not found");
			}
			return { success: true, video };
		}),

	deleteVideo: adminProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input }) => {
			const video = await Video.findByIdAndDelete(input.id);
			if (!video) {
				throw new Error("Video not found");
			}
			return { success: true };
		}),

	// Note CRUD endpoints
	createNote: adminProcedure
		.input(
			z.object({
				title: z.string().min(1),
				content: z.string().min(1),
				fileUrl: z.string().optional(),
				courseId: z.string().min(1),
				moduleId: z.string().optional(),
				videoId: z.string().optional(),
				order: z.number().default(0),
				isPublished: z.boolean().default(false),
			}),
		)
		.handler(async ({ input }) => {
			const note = new Note({
				_id: crypto.randomUUID(),
				...input,
			});
			await note.save();
			return { success: true, note };
		}),

	getNotes: adminProcedure
		.input(
			z.object({
				courseId: z.string().optional(),
				limit: z.number().min(1).max(100).default(50),
				offset: z.number().min(0).default(0),
			}),
		)
		.handler(async ({ input }) => {
			const { courseId, limit, offset } = input;
			const filter: Record<string, unknown> = {};
			if (courseId) {
				filter.courseId = courseId;
			}
			const notes = await Note.find(filter)
				.sort({ order: 1, createdAt: -1 })
				.limit(limit)
				.skip(offset)
				.lean();
			const total = await Note.countDocuments(filter);
			return { notes, total };
		}),

	updateNote: adminProcedure
		.input(
			z.object({
				id: z.string(),
				title: z.string().min(1).optional(),
				content: z.string().min(1).optional(),
				fileUrl: z.string().optional(),
				courseId: z.string().min(1).optional(),
				moduleId: z.string().optional(),
				videoId: z.string().optional(),
				order: z.number().optional(),
				isPublished: z.boolean().optional(),
			}),
		)
		.handler(async ({ input }) => {
			const { id, ...updateData } = input;
			const note = await Note.findByIdAndUpdate(id, updateData, {
				new: true,
			}).lean();
			if (!note) {
				throw new Error("Note not found");
			}
			return { success: true, note };
		}),

	deleteNote: adminProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input }) => {
			const note = await Note.findByIdAndDelete(input.id);
			if (!note) {
				throw new Error("Note not found");
			}
			return { success: true };
		}),

	// DPP CRUD endpoints
	createDPP: adminProcedure
		.input(
			z.object({
				title: z.string().min(1),
				description: z.string().optional(),
				courseId: z.string().min(1),
				moduleId: z.string().optional(),
				date: z.string().transform((str) => new Date(str)),
				subject: z.string().min(1),
				target: z.string().min(1),
				questions: z.array(
					z.object({
						questionText: z.string().min(1),
						questionImage: z.string().optional(),
						options: z
							.array(
								z.object({
									text: z.string().min(1),
									image: z.string().optional(),
								}),
							)
							.length(4),
						correctAnswer: z.number().min(0).max(3),
						marks: z.number().min(1),
						explanation: z.string().optional(),
					}),
				),
				isPublished: z.boolean().default(false),
			}),
		)
		.handler(async ({ input }) => {
			const dpp = new DPP({
				_id: crypto.randomUUID(),
				...input,
			});
			await dpp.save();
			return { success: true, dpp };
		}),

	getDPPs: adminProcedure
		.input(
			z.object({
				courseId: z.string().optional(),
				limit: z.number().min(1).max(100).default(50),
				offset: z.number().min(0).default(0),
			}),
		)
		.handler(async ({ input }) => {
			const { courseId, limit, offset } = input;
			const filter: Record<string, unknown> = {};
			if (courseId) {
				filter.courseId = courseId;
			}
			const dpps = await DPP.find(filter)
				.sort({ date: -1, createdAt: -1 })
				.limit(limit)
				.skip(offset)
				.lean();
			const total = await DPP.countDocuments(filter);
			return { dpps, total };
		}),

	updateDPP: adminProcedure
		.input(
			z.object({
				id: z.string(),
				title: z.string().min(1).optional(),
				description: z.string().optional(),
				courseId: z.string().min(1).optional(),
				moduleId: z.string().optional(),
				date: z
					.string()
					.transform((str) => new Date(str))
					.optional(),
				subject: z.string().min(1).optional(),
				target: z.string().min(1).optional(),
				questions: z
					.array(
						z.object({
							questionText: z.string().min(1),
							questionImage: z.string().optional(),
							options: z
								.array(
									z.object({
										text: z.string().min(1),
										image: z.string().optional(),
									}),
								)
								.length(4),
							correctAnswer: z.number().min(0).max(3),
							marks: z.number().min(1),
							explanation: z.string().optional(),
						}),
					)
					.optional(),
				isPublished: z.boolean().optional(),
			}),
		)
		.handler(async ({ input }) => {
			const { id, ...updateData } = input;
			const dpp = await DPP.findByIdAndUpdate(id, updateData, {
				new: true,
			}).lean();
			if (!dpp) {
				throw new Error("DPP not found");
			}
			return { success: true, dpp };
		}),

	deleteDPP: adminProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input }) => {
			const dpp = await DPP.findByIdAndDelete(input.id);
			if (!dpp) {
				throw new Error("DPP not found");
			}
			return { success: true };
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
