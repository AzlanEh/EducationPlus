/**
 * Bunny Stream Webhook Handler
 *
 * Receives encoding status updates from Bunny Stream when videos finish processing.
 * Configure the webhook URL in Bunny Dashboard: https://dash.bunny.net
 * Set to: https://your-domain.com/webhooks/bunny
 */

import * as crypto from "node:crypto";
import { Video } from "@eduPlus/db";
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
	if (!WEBHOOK_SECRET) {
		console.warn(
			"BUNNY_WEBHOOK_SECRET not set, skipping signature verification",
		);
		return true;
	}

	const expectedSignature = crypto
		.createHmac("sha256", WEBHOOK_SECRET)
		.update(payload)
		.digest("hex");

	return signature === expectedSignature;
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
