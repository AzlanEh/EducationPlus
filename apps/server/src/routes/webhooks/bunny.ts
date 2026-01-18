/**
 * Bunny Stream Webhook Handler
 *
 * Receives encoding status updates from Bunny Stream when videos finish processing.
 * Also handles live stream recording notifications.
 * Configure the webhook URL in Bunny Dashboard: https://dash.bunny.net
 * Set to: https://your-domain.com/webhooks/bunny
 */

import * as crypto from "node:crypto";
import { LiveStream, Video } from "@eduPlus/db";
import { Hono } from "hono";

// Define VideoStatus locally to avoid cross-package dependency issues
type VideoStatus = "pending" | "uploading" | "processing" | "ready" | "error";

// Re-implement the webhook helpers here since we can't import from api package easily
// (The api package bunny module uses process.env which works at runtime)

const BUNNY_API_KEY = process.env.BUNNY_API_KEY || "";
const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID || "";
const BUNNY_CDN_HOSTNAME = process.env.BUNNY_CDN_HOSTNAME || "";

interface BunnyWebhookPayload {
	VideoLibraryId: number;
	VideoGuid: string;
	Status: number;
}

interface BunnyVideoResponse {
	guid: string;
	title: string;
	length: number;
	status: number;
	width: number;
	height: number;
	framerate: number;
	storageSize: number;
	availableResolutions: string;
	encodeProgress: number;
}

function mapBunnyStatus(status: number): VideoStatus {
	switch (status) {
		case 0:
			return "pending";
		case 1:
			return "uploading";
		case 2:
		case 3:
			return "processing";
		case 4:
			return "ready";
		case 5:
			return "error";
		default:
			return "pending";
	}
}

function verifyWebhookSignature(payload: string, signature: string): boolean {
	const WEBHOOK_SECRET = process.env.BUNNY_WEBHOOK_SECRET;
	const nodeEnv = process.env.NODE_ENV;
	const isProduction = nodeEnv === "production";
	const isDevelopmentOrTest =
		nodeEnv === "development" || nodeEnv === "test" || !nodeEnv;

	if (!WEBHOOK_SECRET) {
		if (isProduction) {
			// In production, reject webhooks if secret is not configured
			console.error(
				"[Bunny Webhook] CRITICAL: BUNNY_WEBHOOK_SECRET not set in production. Rejecting webhook.",
			);
			return false;
		}
		if (isDevelopmentOrTest) {
			// In development/test, allow webhooks without signature (with warning)
			console.warn(
				"[Bunny Webhook] BUNNY_WEBHOOK_SECRET not set, skipping signature verification (development/test only)",
			);
			return true;
		}
		// Unknown environment - be safe and reject
		console.error(
			`[Bunny Webhook] BUNNY_WEBHOOK_SECRET not set in unknown environment: ${nodeEnv}. Rejecting webhook.`,
		);
		return false;
	}

	// Use constant-time comparison to prevent timing attacks
	const expectedSignature = crypto
		.createHmac("sha256", WEBHOOK_SECRET)
		.update(payload)
		.digest("hex");

	try {
		return crypto.timingSafeEqual(
			Buffer.from(signature),
			Buffer.from(expectedSignature),
		);
	} catch {
		// If buffers have different lengths, they're not equal
		return false;
	}
}

function parseWebhookPayload(payload: string): {
	libraryId: number;
	videoId: string;
	status: VideoStatus;
} {
	const data = JSON.parse(payload) as BunnyWebhookPayload;

	return {
		libraryId: data.VideoLibraryId,
		videoId: data.VideoGuid,
		status: mapBunnyStatus(data.Status),
	};
}

async function getVideo(videoId: string) {
	const url = `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`;

	const response = await fetch(url, {
		headers: {
			AccessKey: BUNNY_API_KEY,
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error(`Bunny API error: ${response.status}`);
	}

	const video = (await response.json()) as BunnyVideoResponse;

	return {
		videoId: video.guid,
		title: video.title,
		status: mapBunnyStatus(video.status),
		duration: video.length,
		thumbnailUrl: `https://${BUNNY_CDN_HOSTNAME}/${videoId}/thumbnail.jpg`,
		playbackUrl: `https://${BUNNY_CDN_HOSTNAME}/${videoId}/playlist.m3u8`,
		metadata: {
			width: video.width,
			height: video.height,
			framerate: video.framerate,
			fileSize: video.storageSize,
			availableResolutions: video.availableResolutions
				? video.availableResolutions.split(",")
				: [],
		},
	};
}

// Video document type
interface VideoDocument {
	_id: string;
	bunnyVideoId?: string;
	status?: string;
}

export const bunnyWebhookRouter = new Hono();

/**
 * Handle Bunny Stream webhook notifications
 * POST /webhooks/bunny
 *
 * Bunny sends webhooks when:
 * - Video encoding starts
 * - Video encoding completes
 * - Video encoding fails
 */
bunnyWebhookRouter.post("/", async (c) => {
	try {
		// Get raw body for signature verification
		const rawBody = await c.req.text();

		// Verify webhook signature (if configured)
		const signature = c.req.header("X-Bunny-Signature") || "";

		if (!verifyWebhookSignature(rawBody, signature)) {
			console.error("[Bunny Webhook] Invalid signature");
			return c.json({ error: "Invalid signature" }, 401);
		}

		// Parse webhook payload
		const payload = parseWebhookPayload(rawBody);

		console.log("[Bunny Webhook] Received:", {
			videoId: payload.videoId,
			status: payload.status,
		});

		// Find video in database by Bunny video ID
		const result = await Video.findOne({
			bunnyVideoId: payload.videoId,
		}).lean();

		if (!result) {
			console.warn(
				"[Bunny Webhook] Video not found for Bunny ID:",
				payload.videoId,
			);
			// Return 200 anyway to prevent Bunny from retrying
			return c.json({ success: true, message: "Video not found in database" });
		}

		const video = result as unknown as VideoDocument;

		// Update video status
		const updateData: Record<string, unknown> = {
			status: payload.status,
		};

		// If video is ready, fetch full metadata from Bunny
		if (payload.status === "ready") {
			try {
				const bunnyVideo = await getVideo(payload.videoId);
				updateData.duration = bunnyVideo.duration;
				updateData.videoUrl = bunnyVideo.playbackUrl;
				updateData.thumbnailUrl = bunnyVideo.thumbnailUrl;
				updateData.metadata = bunnyVideo.metadata;

				console.log("[Bunny Webhook] Video ready, metadata updated:", {
					videoId: video._id,
					duration: bunnyVideo.duration,
					resolutions: bunnyVideo.metadata.availableResolutions,
				});
			} catch (error) {
				console.error("[Bunny Webhook] Failed to fetch video metadata:", error);
				// Continue with status update even if metadata fetch fails
			}
		}

		await Video.findByIdAndUpdate(video._id, updateData);

		console.log("[Bunny Webhook] Video updated:", {
			videoId: video._id,
			newStatus: payload.status,
		});

		// Check if this video is a live stream recording
		// Live stream recordings are created with a title pattern like "Recording - {streamId}"
		// or we can check if there's a live stream that references this video
		if (payload.status === "ready") {
			await checkAndLinkLiveStreamRecording(payload.videoId, updateData);
		}

		return c.json({ success: true });
	} catch (error) {
		console.error("[Bunny Webhook] Error processing webhook:", error);
		// Return 200 to prevent retries for parsing errors
		return c.json({
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		});
	}
});

/**
 * Check if a video is a live stream recording and link it
 */
async function checkAndLinkLiveStreamRecording(
	bunnyVideoId: string,
	videoData: Record<string, unknown>,
) {
	try {
		// Find any live stream that might be waiting for this recording
		// Bunny creates recordings with the same ID prefix as the stream
		const liveStream = await LiveStream.findOne({
			$or: [
				{ bunnyStreamId: { $regex: bunnyVideoId.substring(0, 8) } },
				{ status: "ended", hasRecording: false },
			],
		});

		if (!liveStream) {
			return;
		}

		// Check if this could be the recording for the stream
		// by comparing timestamps or checking if stream recently ended
		const streamEndedAt = liveStream.endedAt;
		if (!streamEndedAt) {
			return;
		}

		const hoursSinceEnded =
			(Date.now() - new Date(streamEndedAt).getTime()) / (1000 * 60 * 60);

		// Only link recordings for streams that ended within the last 24 hours
		if (hoursSinceEnded > 24) {
			return;
		}

		// Create a video record for the recording if it doesn't exist
		let recordingVideo = await Video.findOne({ bunnyVideoId });

		if (!recordingVideo) {
			// Create new video record for the recording
			recordingVideo = new Video({
				_id: crypto.randomUUID(),
				title: `${liveStream.title} (Recording)`,
				description: `Recording of live stream: ${liveStream.title}`,
				bunnyVideoId,
				videoUrl: videoData.videoUrl,
				thumbnailUrl: videoData.thumbnailUrl,
				duration: videoData.duration,
				status: "ready",
				metadata: videoData.metadata,
				courseId: liveStream.courseId || "uncategorized",
				isPublished: false,
				isLive: false,
			});

			await recordingVideo.save();
		}

		// Link the recording to the live stream
		await LiveStream.findByIdAndUpdate(liveStream._id, {
			recordingVideoId: recordingVideo._id,
			hasRecording: true,
		});

		console.log("[Bunny Webhook] Linked live stream recording:", {
			liveStreamId: liveStream._id,
			recordingVideoId: recordingVideo._id,
		});
	} catch (error) {
		console.error(
			"[Bunny Webhook] Error linking live stream recording:",
			error,
		);
	}
}

/**
 * Health check endpoint for webhook
 * GET /webhooks/bunny
 */
bunnyWebhookRouter.get("/", (c) => {
	return c.json({
		status: "ok",
		service: "bunny-webhook",
		timestamp: new Date().toISOString(),
	});
});
