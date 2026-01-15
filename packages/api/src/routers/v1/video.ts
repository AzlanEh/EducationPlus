import { Video } from "@eduPlus/db";
import { z } from "zod";
import { adminProcedure, protectedProcedure } from "../../index";
import {
	createLiveStream,
	createVideo,
	deleteLiveStream,
	deleteVideo,
	getEmbedUrl,
	getLiveStreamStatus,
	getPlaybackUrl,
	getThumbnailUrl,
	getVideo,
	getVideoStatus,
	updateVideo,
	type VideoStatus,
} from "../../lib/bunny";

// Video document type that includes our new Bunny fields
export interface VideoDocument {
	_id: string;
	title: string;
	description?: string;
	bunnyVideoId?: string;
	videoUrl?: string;
	thumbnailUrl?: string;
	duration?: number;
	status?: VideoStatus;
	isLive?: boolean;
	liveStreamId?: string;
	metadata?: {
		width?: number;
		height?: number;
		framerate?: number;
		fileSize?: number;
		availableResolutions?: string[];
	};
	youtubeVideoId?: string;
	courseId: string;
	moduleId?: string;
	order: number;
	isPublished: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export const videoRouter = {
	/**
	 * Create a new video entry and get upload URL
	 * Returns Bunny video ID and TUS upload URL for direct browser upload
	 */
	create: adminProcedure
		.input(
			z.object({
				title: z.string().min(1),
				description: z.string().optional(),
				courseId: z.string().min(1),
				moduleId: z.string().optional(),
				order: z.number().default(0),
			}),
		)
		.handler(async ({ input }) => {
			// Create video in Bunny Stream
			const { videoId: bunnyVideoId, uploadUrl } = await createVideo(
				input.title,
			);

			// Create video record in database
			const video = new Video({
				_id: crypto.randomUUID(),
				title: input.title,
				description: input.description,
				bunnyVideoId,
				status: "pending",
				courseId: input.courseId,
				moduleId: input.moduleId,
				order: input.order,
				isPublished: false,
			});

			await video.save();
			const savedVideo = video.toObject() as VideoDocument;

			return {
				success: true,
				video: {
					id: savedVideo._id,
					bunnyVideoId,
					title: savedVideo.title,
					status: savedVideo.status,
				},
				uploadUrl,
			};
		}),

	/**
	 * Get video details including playback URL
	 */
	get: protectedProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input }) => {
			const result = await Video.findById(input.id).lean();
			if (!result) {
				throw new Error("Video not found");
			}
			const video = result as unknown as VideoDocument;

			// Build response with playback URLs
			let playbackUrl: string | undefined;
			let thumbnailUrl: string | undefined;
			let embedUrl: string | undefined;

			if (video.bunnyVideoId && video.status === "ready") {
				playbackUrl = getPlaybackUrl(video.bunnyVideoId);
				thumbnailUrl = getThumbnailUrl(video.bunnyVideoId);
				embedUrl = getEmbedUrl(video.bunnyVideoId);
			}

			return {
				id: video._id,
				title: video.title,
				description: video.description,
				status: video.status,
				duration: video.duration,
				playbackUrl,
				thumbnailUrl,
				embedUrl,
				isLive: video.isLive,
				metadata: video.metadata,
				courseId: video.courseId,
				moduleId: video.moduleId,
				order: video.order,
				isPublished: video.isPublished,
				createdAt: video.createdAt,
				updatedAt: video.updatedAt,
			};
		}),

	/**
	 * Get video encoding status from Bunny
	 */
	getStatus: adminProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input }) => {
			const result = await Video.findById(input.id).lean();
			if (!result) {
				throw new Error("Video not found");
			}
			const video = result as unknown as VideoDocument;

			if (!video.bunnyVideoId) {
				return {
					id: video._id,
					status: video.status || "pending",
					encodeProgress: 0,
					isReady: false,
				};
			}

			try {
				const bunnyStatus = await getVideoStatus(video.bunnyVideoId);

				// Update database if status changed
				if (bunnyStatus.status !== video.status) {
					await Video.findByIdAndUpdate(input.id, {
						status: bunnyStatus.status,
					});
				}

				return {
					id: video._id,
					status: bunnyStatus.status,
					encodeProgress: bunnyStatus.encodeProgress,
					isReady: bunnyStatus.isReady,
				};
			} catch {
				return {
					id: video._id,
					status: video.status || "pending",
					encodeProgress: 0,
					isReady: video.status === "ready",
				};
			}
		}),

	/**
	 * Mark video upload as started (called when TUS upload begins)
	 */
	markUploading: adminProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input }) => {
			const result = await Video.findByIdAndUpdate(
				input.id,
				{ status: "uploading" },
				{ new: true },
			).lean();

			if (!result) {
				throw new Error("Video not found");
			}
			const video = result as unknown as VideoDocument;

			return { success: true, status: video.status };
		}),

	/**
	 * Update video metadata after encoding completes
	 * Called by webhook or polling
	 */
	syncFromBunny: adminProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input }) => {
			const result = await Video.findById(input.id).lean();
			if (!result) {
				throw new Error("Video not found");
			}
			const video = result as unknown as VideoDocument;

			if (!video.bunnyVideoId) {
				throw new Error("Video has no Bunny ID");
			}

			const bunnyVideo = await getVideo(video.bunnyVideoId);

			// Update database with Bunny metadata
			const updatedResult = await Video.findByIdAndUpdate(
				input.id,
				{
					status: bunnyVideo.status,
					duration: bunnyVideo.duration,
					videoUrl: bunnyVideo.playbackUrl,
					thumbnailUrl: bunnyVideo.thumbnailUrl,
					metadata: bunnyVideo.metadata,
				},
				{ new: true },
			).lean();

			return {
				success: true,
				video: updatedResult as unknown as VideoDocument,
			};
		}),

	/**
	 * Update video details
	 */
	update: adminProcedure
		.input(
			z.object({
				id: z.string(),
				title: z.string().min(1).optional(),
				description: z.string().optional(),
				courseId: z.string().min(1).optional(),
				moduleId: z.string().nullable().optional(),
				order: z.number().optional(),
				isPublished: z.boolean().optional(),
			}),
		)
		.handler(async ({ input }) => {
			const { id, moduleId, ...updateData } = input;

			// Build update object
			const update: Record<string, unknown> = { ...updateData };

			// Handle moduleId null case (unset)
			if (moduleId === null) {
				update.$unset = { moduleId: 1 };
			} else if (moduleId !== undefined) {
				update.moduleId = moduleId;
			}

			const result = await Video.findByIdAndUpdate(id, update, {
				new: true,
			}).lean();

			if (!result) {
				throw new Error("Video not found");
			}
			const video = result as unknown as VideoDocument;

			// Also update title in Bunny if changed
			if (updateData.title && video.bunnyVideoId) {
				try {
					await updateVideo(video.bunnyVideoId, {
						title: updateData.title,
					});
				} catch {
					// Non-critical, just log
					console.warn("Failed to update video title in Bunny");
				}
			}

			return { success: true, video };
		}),

	/**
	 * Delete video from database and Bunny
	 */
	delete: adminProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input }) => {
			const result = await Video.findById(input.id).lean();
			if (!result) {
				throw new Error("Video not found");
			}
			const video = result as unknown as VideoDocument;

			// Delete from Bunny if exists
			if (video.bunnyVideoId) {
				try {
					await deleteVideo(video.bunnyVideoId);
				} catch {
					// Log but don't fail - video might already be deleted
					console.warn(
						"Failed to delete video from Bunny:",
						video.bunnyVideoId,
					);
				}
			}

			// Delete from database
			await Video.findByIdAndDelete(input.id);

			return { success: true };
		}),

	/**
	 * List videos for a course
	 */
	listByCourse: protectedProcedure
		.input(
			z.object({
				courseId: z.string(),
				moduleId: z.string().optional(),
				includeUnpublished: z.boolean().default(false),
				limit: z.number().min(1).max(100).default(50),
				offset: z.number().min(0).default(0),
			}),
		)
		.handler(async ({ input, context }) => {
			const { courseId, moduleId, includeUnpublished, limit, offset } = input;

			const filter: Record<string, unknown> = { courseId };

			if (moduleId) {
				filter.moduleId = moduleId;
			}

			// Only admins can see unpublished videos
			const user = context.session?.user as { role?: string } | undefined;
			if (!includeUnpublished || user?.role !== "admin") {
				filter.isPublished = true;
			}

			const [results, total] = await Promise.all([
				Video.find(filter)
					.sort({ order: 1, createdAt: -1 })
					.skip(offset)
					.limit(limit)
					.lean(),
				Video.countDocuments(filter),
			]);

			const videos = results as unknown as VideoDocument[];

			// Add playback URLs for ready videos
			const videosWithUrls = videos.map((video) => ({
				id: video._id,
				title: video.title,
				description: video.description,
				status: video.status,
				duration: video.duration,
				thumbnailUrl:
					video.bunnyVideoId && video.status === "ready"
						? getThumbnailUrl(video.bunnyVideoId)
						: undefined,
				playbackUrl:
					video.bunnyVideoId && video.status === "ready"
						? getPlaybackUrl(video.bunnyVideoId)
						: undefined,
				embedUrl:
					video.bunnyVideoId && video.status === "ready"
						? getEmbedUrl(video.bunnyVideoId)
						: undefined,
				order: video.order,
				isPublished: video.isPublished,
				moduleId: video.moduleId,
			}));

			return {
				videos: videosWithUrls,
				total,
			};
		}),

	/**
	 * List all videos (admin only) - for video management dashboard
	 */
	listAll: adminProcedure
		.input(
			z.object({
				status: z
					.enum(["pending", "uploading", "processing", "ready", "error"])
					.optional(),
				search: z.string().optional(),
				limit: z.number().min(1).max(100).default(50),
				offset: z.number().min(0).default(0),
			}),
		)
		.handler(async ({ input }) => {
			const { status, search, limit, offset } = input;

			const filter: Record<string, unknown> = {};

			if (status) {
				filter.status = status;
			}

			if (search) {
				filter.title = { $regex: search, $options: "i" };
			}

			const [results, total] = await Promise.all([
				Video.find(filter)
					.sort({ createdAt: -1 })
					.skip(offset)
					.limit(limit)
					.lean(),
				Video.countDocuments(filter),
			]);

			const videos = results as unknown as VideoDocument[];

			// Add playback URLs for ready videos
			const videosWithUrls = videos.map((video) => ({
				id: video._id,
				title: video.title,
				description: video.description,
				status: video.status,
				duration: video.duration,
				thumbnailUrl:
					video.bunnyVideoId && video.status === "ready"
						? getThumbnailUrl(video.bunnyVideoId)
						: undefined,
				playbackUrl:
					video.bunnyVideoId && video.status === "ready"
						? getPlaybackUrl(video.bunnyVideoId)
						: undefined,
				embedUrl:
					video.bunnyVideoId && video.status === "ready"
						? getEmbedUrl(video.bunnyVideoId)
						: undefined,
				courseId: video.courseId,
				isPublished: video.isPublished,
				isLive: video.isLive,
				createdAt: video.createdAt,
			}));

			return {
				videos: videosWithUrls,
				total,
			};
		}),

	/* -------------------------------------------------------------------------- */
	/*                               LIVE STREAMING                               */
	/* -------------------------------------------------------------------------- */

	/**
	 * Create a live stream
	 */
	createLiveStream: adminProcedure
		.input(
			z.object({
				title: z.string().min(1),
				description: z.string().optional(),
				courseId: z.string().min(1),
				moduleId: z.string().optional(),
			}),
		)
		.handler(async ({ input }) => {
			// Create live stream in Bunny
			const stream = await createLiveStream(input.title);

			// Create video record for the live stream
			const video = new Video({
				_id: crypto.randomUUID(),
				title: input.title,
				description: input.description,
				isLive: true,
				liveStreamId: stream.streamId,
				status: "ready",
				courseId: input.courseId,
				moduleId: input.moduleId,
				isPublished: false,
			});

			await video.save();
			const savedVideo = video.toObject() as VideoDocument;

			return {
				success: true,
				video: {
					id: savedVideo._id,
					title: savedVideo.title,
				},
				stream: {
					streamId: stream.streamId,
					rtmpUrl: stream.rtmpUrl,
					rtmpKey: stream.rtmpKey,
					playbackUrl: stream.playbackUrl,
				},
			};
		}),

	/**
	 * Get live stream status
	 */
	getLiveStreamStatus: adminProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input }) => {
			const result = await Video.findById(input.id).lean();
			if (!result) {
				throw new Error("Video not found");
			}
			const video = result as unknown as VideoDocument;

			if (!video.liveStreamId) {
				throw new Error("Video is not a live stream");
			}

			const status = await getLiveStreamStatus(video.liveStreamId);

			return {
				id: video._id,
				streamId: status.streamId,
				status: status.status,
				rtmpUrl: status.rtmpUrl,
				playbackUrl: status.playbackUrl,
			};
		}),

	/**
	 * Delete live stream
	 */
	deleteLiveStream: adminProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input }) => {
			const result = await Video.findById(input.id).lean();
			if (!result) {
				throw new Error("Video not found");
			}
			const video = result as unknown as VideoDocument;

			if (!video.liveStreamId) {
				throw new Error("Video is not a live stream");
			}

			try {
				await deleteLiveStream(video.liveStreamId);
			} catch {
				console.warn(
					"Failed to delete live stream from Bunny:",
					video.liveStreamId,
				);
			}

			await Video.findByIdAndDelete(input.id);

			return { success: true };
		}),
};
