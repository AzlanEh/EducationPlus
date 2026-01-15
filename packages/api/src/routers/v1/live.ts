import { LiveStream } from "@eduPlus/db";
import { z } from "zod";
import { adminProcedure, protectedProcedure } from "../../index";
import {
	createLiveStream as bunnyCreateLiveStream,
	deleteLiveStream as bunnyDeleteLiveStream,
	getLiveStreamStatus as bunnyGetLiveStreamStatus,
} from "../../lib/bunny";

// Live stream status type
export type LiveStreamStatus =
	| "scheduled"
	| "not_started"
	| "starting"
	| "running"
	| "stopping"
	| "stopped"
	| "ended";

// Live stream document interface
export interface LiveStreamDocument {
	_id: string;
	title: string;
	description?: string;
	bunnyStreamId: string;
	rtmpUrl?: string;
	rtmpKey?: string;
	playbackUrl?: string;
	status: LiveStreamStatus;
	scheduledAt?: Date;
	startedAt?: Date;
	endedAt?: Date;
	recordingVideoId?: string;
	hasRecording: boolean;
	courseId?: string;
	instructorId: string;
	thumbnailUrl?: string;
	isPublished: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export const liveRouter = {
	/**
	 * Create a new live stream
	 * Returns RTMP URL and stream key for OBS/broadcasting software
	 */
	create: adminProcedure
		.input(
			z.object({
				title: z.string().min(1),
				description: z.string().optional(),
				courseId: z.string().optional(),
				scheduledAt: z.string().datetime().optional(),
				thumbnailUrl: z.string().url().optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			const userId = context.session?.user?.id;
			if (!userId) throw new Error("Unauthorized");

			// Create live stream in Bunny
			const bunnyStream = await bunnyCreateLiveStream(input.title);

			// Create live stream record in database
			const liveStream = new LiveStream({
				_id: crypto.randomUUID(),
				title: input.title,
				description: input.description,
				bunnyStreamId: bunnyStream.streamId,
				rtmpUrl: bunnyStream.rtmpUrl,
				rtmpKey: bunnyStream.rtmpKey,
				playbackUrl: bunnyStream.playbackUrl,
				status: input.scheduledAt ? "scheduled" : "not_started",
				scheduledAt: input.scheduledAt
					? new Date(input.scheduledAt)
					: undefined,
				courseId: input.courseId,
				instructorId: userId,
				thumbnailUrl: input.thumbnailUrl,
				isPublished: false,
			});

			await liveStream.save();

			return {
				id: liveStream._id,
				bunnyStreamId: bunnyStream.streamId,
				rtmpUrl: bunnyStream.rtmpUrl,
				rtmpKey: bunnyStream.rtmpKey,
				playbackUrl: bunnyStream.playbackUrl,
			};
		}),

	/**
	 * Get live stream details (admin - includes RTMP key)
	 */
	get: adminProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input }) => {
			const liveStream = await LiveStream.findById(input.id).lean();
			if (!liveStream) throw new Error("Live stream not found");

			// Get current status from Bunny
			try {
				const bunnyStatus = await bunnyGetLiveStreamStatus(
					liveStream.bunnyStreamId as string,
				);

				// Update status if changed
				if (bunnyStatus.status !== liveStream.status) {
					await LiveStream.updateOne(
						{ _id: input.id },
						{ status: bunnyStatus.status },
					);
					(liveStream as any).status = bunnyStatus.status;
				}
			} catch (error) {
				console.error("Failed to get Bunny stream status:", error);
			}

			return { liveStream };
		}),

	/**
	 * List all live streams (admin)
	 */
	list: adminProcedure
		.input(
			z.object({
				status: z
					.enum([
						"scheduled",
						"not_started",
						"starting",
						"running",
						"stopping",
						"stopped",
						"ended",
					])
					.optional(),
				courseId: z.string().optional(),
				limit: z.number().min(1).max(100).default(20),
				offset: z.number().min(0).default(0),
			}),
		)
		.handler(async ({ input }) => {
			const filter: Record<string, unknown> = {};
			if (input.status) filter.status = input.status;
			if (input.courseId) filter.courseId = input.courseId;

			const [liveStreams, total] = await Promise.all([
				LiveStream.find(filter)
					.sort({ createdAt: -1 })
					.limit(input.limit)
					.skip(input.offset)
					.select("-rtmpKey") // Don't include RTMP key in list
					.lean(),
				LiveStream.countDocuments(filter),
			]);

			return { liveStreams, total };
		}),

	/**
	 * Get active/live streams (admin)
	 */
	getActive: adminProcedure.handler(async () => {
		const activeStreams = await LiveStream.find({
			status: { $in: ["starting", "running"] },
		})
			.sort({ startedAt: -1 })
			.lean();

		return { liveStreams: activeStreams };
	}),

	/**
	 * Update live stream details
	 */
	update: adminProcedure
		.input(
			z.object({
				id: z.string(),
				title: z.string().min(1).optional(),
				description: z.string().optional(),
				courseId: z.string().optional(),
				scheduledAt: z.string().datetime().optional(),
				thumbnailUrl: z.string().url().optional(),
				isPublished: z.boolean().optional(),
			}),
		)
		.handler(async ({ input }) => {
			const { id, ...updateData } = input;

			const liveStream = await LiveStream.findByIdAndUpdate(
				id,
				{
					...updateData,
					scheduledAt: updateData.scheduledAt
						? new Date(updateData.scheduledAt)
						: undefined,
				},
				{ new: true },
			).lean();

			if (!liveStream) throw new Error("Live stream not found");

			return { liveStream };
		}),

	/**
	 * Mark stream as started (called when admin starts broadcasting)
	 */
	start: adminProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input }) => {
			const liveStream = await LiveStream.findById(input.id);
			if (!liveStream) throw new Error("Live stream not found");

			// Update status
			liveStream.status = "starting";
			liveStream.startedAt = new Date();
			await liveStream.save();

			return { success: true, liveStream };
		}),

	/**
	 * Mark stream as running (can be called by webhook or polling)
	 */
	markRunning: adminProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input }) => {
			const liveStream = await LiveStream.findByIdAndUpdate(
				input.id,
				{ status: "running" },
				{ new: true },
			).lean();

			if (!liveStream) throw new Error("Live stream not found");

			return { success: true, liveStream };
		}),

	/**
	 * End live stream
	 */
	end: adminProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input }) => {
			const liveStream = await LiveStream.findById(input.id);
			if (!liveStream) throw new Error("Live stream not found");

			// Update status
			liveStream.status = "ended";
			liveStream.endedAt = new Date();
			await liveStream.save();

			return { success: true, liveStream };
		}),

	/**
	 * Delete live stream
	 */
	delete: adminProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input }) => {
			const liveStream = await LiveStream.findById(input.id);
			if (!liveStream) throw new Error("Live stream not found");

			// Don't allow deleting running streams
			if (liveStream.status === "running" || liveStream.status === "starting") {
				throw new Error(
					"Cannot delete a live stream that is currently running",
				);
			}

			// Delete from Bunny
			try {
				await bunnyDeleteLiveStream(liveStream.bunnyStreamId as string);
			} catch (error) {
				console.error("Failed to delete Bunny stream:", error);
				// Continue with DB deletion even if Bunny deletion fails
			}

			// Delete from database
			await LiveStream.deleteOne({ _id: input.id });

			return { success: true };
		}),

	/**
	 * Sync status from Bunny (polling endpoint)
	 */
	syncStatus: adminProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input }) => {
			const liveStream = await LiveStream.findById(input.id);
			if (!liveStream) throw new Error("Live stream not found");

			// Get current status from Bunny
			const bunnyStatus = await bunnyGetLiveStreamStatus(
				liveStream.bunnyStreamId as string,
			);

			// Map Bunny status to our status
			let newStatus: LiveStreamStatus = liveStream.status as LiveStreamStatus;
			if (bunnyStatus.status === "running" && liveStream.status !== "running") {
				newStatus = "running";
				if (!liveStream.startedAt) {
					liveStream.startedAt = new Date();
				}
			} else if (
				bunnyStatus.status === "stopped" &&
				liveStream.status === "running"
			) {
				newStatus = "stopped";
			}

			// Update if changed
			if (newStatus !== liveStream.status) {
				liveStream.status = newStatus;
				await liveStream.save();
			}

			return {
				status: newStatus,
				bunnyStatus: bunnyStatus.status,
				playbackUrl: bunnyStatus.playbackUrl,
			};
		}),

	/**
	 * Get stream statistics
	 */
	getStats: adminProcedure.handler(async () => {
		const [total, scheduled, active, ended] = await Promise.all([
			LiveStream.countDocuments(),
			LiveStream.countDocuments({ status: "scheduled" }),
			LiveStream.countDocuments({ status: { $in: ["starting", "running"] } }),
			LiveStream.countDocuments({ status: "ended" }),
		]);

		return { total, scheduled, active, ended };
	}),

	// ============== STUDENT/PUBLIC ENDPOINTS ==============

	/**
	 * Get published live streams (for students)
	 */
	getPublished: protectedProcedure
		.input(
			z.object({
				courseId: z.string().optional(),
				limit: z.number().min(1).max(20).default(10),
			}),
		)
		.handler(async ({ input }) => {
			const filter: Record<string, unknown> = {
				isPublished: true,
				status: { $in: ["scheduled", "starting", "running"] },
			};
			if (input.courseId) filter.courseId = input.courseId;

			const liveStreams = await LiveStream.find(filter)
				.sort({ scheduledAt: 1, createdAt: -1 })
				.limit(input.limit)
				.select("-rtmpUrl -rtmpKey") // Don't expose RTMP details to students
				.lean();

			return { liveStreams };
		}),

	/**
	 * Get live stream playback info (for students)
	 */
	getPlayback: protectedProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input }) => {
			const liveStream = await LiveStream.findOne({
				_id: input.id,
				isPublished: true,
			})
				.select("-rtmpUrl -rtmpKey")
				.lean();

			if (!liveStream) throw new Error("Live stream not found");

			// Check if stream is accessible
			const accessibleStatuses = ["starting", "running"];
			if (!accessibleStatuses.includes(liveStream.status as string)) {
				return {
					liveStream,
					canWatch: false,
					message:
						liveStream.status === "scheduled"
							? "Stream has not started yet"
							: "Stream has ended",
				};
			}

			return {
				liveStream,
				canWatch: true,
				playbackUrl: liveStream.playbackUrl,
			};
		}),

	/**
	 * Get currently live streams (for home screen banner)
	 */
	getLiveNow: protectedProcedure.handler(async () => {
		const liveStreams = await LiveStream.find({
			isPublished: true,
			status: "running",
		})
			.select("-rtmpUrl -rtmpKey")
			.sort({ startedAt: -1 })
			.limit(5)
			.lean();

		return { liveStreams };
	}),
};
