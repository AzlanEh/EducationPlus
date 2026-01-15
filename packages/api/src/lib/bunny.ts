/**
 * Bunny Stream API Helper
 *
 * Documentation: https://docs.bunny.net/reference/api-overview
 * Stream API: https://docs.bunny.net/reference/video_uploadvideo
 */

import * as crypto from "node:crypto";

const BUNNY_API_KEY = process.env.BUNNY_API_KEY || "";
const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID || "";
const BUNNY_CDN_HOSTNAME = process.env.BUNNY_CDN_HOSTNAME || "";

const STREAM_API_BASE = "https://video.bunnycdn.com/library";

interface BunnyVideoResponse {
	videoLibraryId: number;
	guid: string;
	title: string;
	dateUploaded: string;
	views: number;
	isPublic: boolean;
	length: number; // duration in seconds
	status: number; // 0=created, 1=uploaded, 2=processing, 3=transcoding, 4=finished, 5=error
	framerate: number;
	rotation: number;
	width: number;
	height: number;
	availableResolutions: string;
	thumbnailCount: number;
	encodeProgress: number;
	storageSize: number;
	captions: Array<{ srclang: string; label: string }>;
	hasMP4Fallback: boolean;
	collectionId: string;
	thumbnailFileName: string;
	averageWatchTime: number;
	totalWatchTime: number;
	category: string;
	chapters: Array<{ title: string; start: number; end: number }>;
	moments: Array<{ label: string; timestamp: number }>;
	metaTags: Array<{ property: string; value: string }>;
}

interface BunnyCreateVideoResponse {
	videoLibraryId: number;
	guid: string;
	title: string;
	dateUploaded: string;
	views: number;
	isPublic: boolean;
	length: number;
	status: number;
}

interface BunnyLiveStreamResponse {
	id: string;
	name: string;
	rtmpPath: string;
	rtmpKey: string;
	rtmpUrl: string;
	pullUrl: string;
	pullZoneId: number;
	status: number; // 0=not_started, 1=starting, 2=running, 3=stopping, 4=stopped
}

export type VideoStatus =
	| "pending"
	| "uploading"
	| "processing"
	| "ready"
	| "error";

/**
 * Map Bunny video status code to our status enum
 */
function mapBunnyStatus(status: number): VideoStatus {
	switch (status) {
		case 0: // created
			return "pending";
		case 1: // uploaded
			return "uploading";
		case 2: // processing
		case 3: // transcoding
			return "processing";
		case 4: // finished
			return "ready";
		case 5: // error
			return "error";
		default:
			return "pending";
	}
}

/**
 * Make authenticated request to Bunny Stream API
 */
async function bunnyFetch<T>(
	endpoint: string,
	options: RequestInit = {},
): Promise<T> {
	const url = `${STREAM_API_BASE}/${BUNNY_LIBRARY_ID}${endpoint}`;

	const response = await fetch(url, {
		...options,
		headers: {
			AccessKey: BUNNY_API_KEY,
			"Content-Type": "application/json",
			...options.headers,
		},
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(
			`Bunny API error (${response.status}): ${errorText || response.statusText}`,
		);
	}

	// Handle empty response (e.g., DELETE)
	const text = await response.text();
	if (!text) {
		return {} as T;
	}

	return JSON.parse(text) as T;
}

/* -------------------------------------------------------------------------- */
/*                              VIDEO MANAGEMENT                              */
/* -------------------------------------------------------------------------- */

/**
 * Create a new video in Bunny Stream library
 * Returns the video GUID needed for uploading
 */
export async function createVideo(title: string): Promise<{
	videoId: string;
	uploadUrl: string;
}> {
	const video = await bunnyFetch<BunnyCreateVideoResponse>("/videos", {
		method: "POST",
		body: JSON.stringify({ title }),
	});

	return {
		videoId: video.guid,
		uploadUrl: getTusUploadUrl(video.guid),
	};
}

/**
 * Get TUS resumable upload URL for a video
 * Use this URL with tus-js-client for chunked uploads
 */
export function getTusUploadUrl(videoId: string): string {
	return `https://video.bunnycdn.com/tusupload?videoId=${videoId}&libraryId=${BUNNY_LIBRARY_ID}&AuthorizationSignature=${generateUploadSignature(videoId)}&AuthorizationExpire=${getExpirationTimestamp()}`;
}

/**
 * Generate upload signature for TUS uploads
 * Signature = SHA256(library_id + api_key + expiration_time + video_id)
 */
function generateUploadSignature(videoId: string): string {
	const expirationTime = getExpirationTimestamp();
	const signatureString = `${BUNNY_LIBRARY_ID}${BUNNY_API_KEY}${expirationTime}${videoId}`;
	return crypto.createHash("sha256").update(signatureString).digest("hex");
}

/**
 * Get expiration timestamp (1 hour from now)
 */
function getExpirationTimestamp(): number {
	return Math.floor(Date.now() / 1000) + 3600;
}

/**
 * Get video details from Bunny Stream
 */
export async function getVideo(videoId: string): Promise<{
	videoId: string;
	title: string;
	status: VideoStatus;
	duration: number;
	thumbnailUrl: string;
	playbackUrl: string;
	embedUrl: string;
	metadata: {
		width: number;
		height: number;
		framerate: number;
		fileSize: number;
		availableResolutions: string[];
	};
	encodeProgress: number;
}> {
	const video = await bunnyFetch<BunnyVideoResponse>(`/videos/${videoId}`);

	return {
		videoId: video.guid,
		title: video.title,
		status: mapBunnyStatus(video.status),
		duration: video.length,
		thumbnailUrl: getThumbnailUrl(videoId),
		playbackUrl: getPlaybackUrl(videoId),
		embedUrl: getEmbedUrl(videoId),
		metadata: {
			width: video.width,
			height: video.height,
			framerate: video.framerate,
			fileSize: video.storageSize,
			availableResolutions: video.availableResolutions
				? video.availableResolutions.split(",")
				: [],
		},
		encodeProgress: video.encodeProgress,
	};
}

/**
 * Get video encoding status
 */
export async function getVideoStatus(videoId: string): Promise<{
	status: VideoStatus;
	encodeProgress: number;
	isReady: boolean;
}> {
	const video = await bunnyFetch<BunnyVideoResponse>(`/videos/${videoId}`);

	return {
		status: mapBunnyStatus(video.status),
		encodeProgress: video.encodeProgress,
		isReady: video.status === 4,
	};
}

/**
 * Get HLS playback URL for a video
 */
export function getPlaybackUrl(videoId: string): string {
	return `https://${BUNNY_CDN_HOSTNAME}/${videoId}/playlist.m3u8`;
}

/**
 * Get thumbnail URL for a video
 */
export function getThumbnailUrl(
	videoId: string,
	thumbnailName = "thumbnail.jpg",
): string {
	return `https://${BUNNY_CDN_HOSTNAME}/${videoId}/${thumbnailName}`;
}

/**
 * Get embed URL for Bunny's video player
 */
export function getEmbedUrl(videoId: string): string {
	return `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}`;
}

/**
 * Delete a video from Bunny Stream
 */
export async function deleteVideo(videoId: string): Promise<void> {
	await bunnyFetch(`/videos/${videoId}`, {
		method: "DELETE",
	});
}

/**
 * Update video title or metadata
 */
export async function updateVideo(
	videoId: string,
	data: {
		title?: string;
		collectionId?: string;
	},
): Promise<void> {
	await bunnyFetch(`/videos/${videoId}`, {
		method: "POST",
		body: JSON.stringify(data),
	});
}

/**
 * List videos in the library
 */
export async function listVideos(options?: {
	page?: number;
	itemsPerPage?: number;
	search?: string;
	orderBy?: "date" | "title";
}): Promise<{
	items: Array<{
		videoId: string;
		title: string;
		status: VideoStatus;
		duration: number;
		thumbnailUrl: string;
	}>;
	totalItems: number;
	currentPage: number;
	itemsPerPage: number;
}> {
	const params = new URLSearchParams();
	if (options?.page) params.set("page", options.page.toString());
	if (options?.itemsPerPage)
		params.set("itemsPerPage", options.itemsPerPage.toString());
	if (options?.search) params.set("search", options.search);
	if (options?.orderBy) params.set("orderBy", options.orderBy);

	const queryString = params.toString();
	const endpoint = `/videos${queryString ? `?${queryString}` : ""}`;

	const response = await bunnyFetch<{
		items: BunnyVideoResponse[];
		totalItems: number;
		currentPage: number;
		itemsPerPage: number;
	}>(endpoint);

	return {
		items: response.items.map((video) => ({
			videoId: video.guid,
			title: video.title,
			status: mapBunnyStatus(video.status),
			duration: video.length,
			thumbnailUrl: getThumbnailUrl(video.guid),
		})),
		totalItems: response.totalItems,
		currentPage: response.currentPage,
		itemsPerPage: response.itemsPerPage,
	};
}

/* -------------------------------------------------------------------------- */
/*                               LIVE STREAMING                               */
/* -------------------------------------------------------------------------- */

const STREAM_BASE = "https://api.bunny.net/stream";

/**
 * Make authenticated request to Bunny Stream API (for live streaming)
 */
async function bunnyStreamFetch<T>(
	endpoint: string,
	options: RequestInit = {},
): Promise<T> {
	const response = await fetch(`${STREAM_BASE}${endpoint}`, {
		...options,
		headers: {
			AccessKey: BUNNY_API_KEY,
			"Content-Type": "application/json",
			...options.headers,
		},
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(
			`Bunny Stream API error (${response.status}): ${errorText || response.statusText}`,
		);
	}

	const text = await response.text();
	if (!text) {
		return {} as T;
	}

	return JSON.parse(text) as T;
}

/**
 * Create a new live stream
 */
export async function createLiveStream(name: string): Promise<{
	streamId: string;
	rtmpUrl: string;
	rtmpKey: string;
	playbackUrl: string;
}> {
	const stream = await bunnyStreamFetch<BunnyLiveStreamResponse>(
		`/videolibraries/${BUNNY_LIBRARY_ID}/streams`,
		{
			method: "POST",
			body: JSON.stringify({ name }),
		},
	);

	return {
		streamId: stream.id,
		rtmpUrl: stream.rtmpUrl,
		rtmpKey: stream.rtmpKey,
		playbackUrl: stream.pullUrl,
	};
}

/**
 * Get live stream status
 */
export async function getLiveStreamStatus(streamId: string): Promise<{
	streamId: string;
	name: string;
	status: "not_started" | "starting" | "running" | "stopping" | "stopped";
	rtmpUrl: string;
	playbackUrl: string;
}> {
	const stream = await bunnyStreamFetch<BunnyLiveStreamResponse>(
		`/videolibraries/${BUNNY_LIBRARY_ID}/streams/${streamId}`,
	);

	const statusMap = {
		0: "not_started",
		1: "starting",
		2: "running",
		3: "stopping",
		4: "stopped",
	} as const;

	return {
		streamId: stream.id,
		name: stream.name,
		status: statusMap[stream.status as keyof typeof statusMap] || "not_started",
		rtmpUrl: stream.rtmpUrl,
		playbackUrl: stream.pullUrl,
	};
}

/**
 * Delete a live stream
 */
export async function deleteLiveStream(streamId: string): Promise<void> {
	await bunnyStreamFetch(
		`/videolibraries/${BUNNY_LIBRARY_ID}/streams/${streamId}`,
		{
			method: "DELETE",
		},
	);
}

/* -------------------------------------------------------------------------- */
/*                              WEBHOOK HELPERS                               */
/* -------------------------------------------------------------------------- */

interface BunnyWebhookPayload {
	VideoLibraryId: number;
	VideoGuid: string;
	Status: number;
}

/**
 * Verify webhook signature
 * Bunny sends webhooks when video encoding status changes
 */
export function verifyWebhookSignature(
	payload: string,
	signature: string,
): boolean {
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

/**
 * Parse webhook payload from Bunny Stream
 */
export function parseWebhookPayload(payload: string): {
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

/* -------------------------------------------------------------------------- */
/*                              UTILITY EXPORTS                               */
/* -------------------------------------------------------------------------- */

export const bunny = {
	// Video management
	createVideo,
	getVideo,
	getVideoStatus,
	deleteVideo,
	updateVideo,
	listVideos,

	// URL generators
	getTusUploadUrl,
	getPlaybackUrl,
	getThumbnailUrl,
	getEmbedUrl,

	// Live streaming
	createLiveStream,
	getLiveStreamStatus,
	deleteLiveStream,

	// Webhook helpers
	verifyWebhookSignature,
	parseWebhookPayload,
};

export default bunny;
