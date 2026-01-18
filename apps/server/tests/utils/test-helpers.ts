/**
 * Test Helpers and Utilities
 */

import { vi } from "vitest";

// Mock user session for protected routes
export const mockAdminSession = {
	user: {
		id: "test-admin-id",
		name: "Test Admin",
		email: "admin@test.com",
		role: "admin",
	},
	session: {
		id: "test-session-id",
		expiresAt: new Date(Date.now() + 86400000), // 24 hours from now
	},
};

export const mockStudentSession = {
	user: {
		id: "test-student-id",
		name: "Test Student",
		email: "student@test.com",
		role: "user",
	},
	session: {
		id: "test-session-id",
		expiresAt: new Date(Date.now() + 86400000),
	},
};

// Mock Bunny API responses
export const mockBunnyVideo = {
	videoId: "test-bunny-video-id",
	title: "Test Video",
	status: "ready" as const,
	duration: 300,
	thumbnailUrl: "https://cdn.test.com/thumb.jpg",
	playbackUrl: "https://cdn.test.com/playlist.m3u8",
	embedUrl: "https://iframe.mediadelivery.net/embed/123/test-bunny-video-id",
	metadata: {
		width: 1920,
		height: 1080,
		framerate: 30,
		fileSize: 50000000,
		availableResolutions: ["1080p", "720p", "480p"],
	},
	encodeProgress: 100,
};

export const mockBunnyCreateVideoResponse = {
	videoId: "new-bunny-video-id",
	uploadUrl: "https://video.bunnycdn.com/tusupload?videoId=new-bunny-video-id",
};

export const mockBunnyLiveStream = {
	streamId: "test-live-stream-id",
	name: "Test Live Stream",
	rtmpUrl: "rtmp://ingest.bunny.net/live",
	rtmpKey: "test-stream-key",
	playbackUrl: "https://cdn.test.com/live/playlist.m3u8",
	status: "not_started" as const,
};

// Sample test data
export const sampleVideo = {
	_id: "test-video-id",
	title: "Test Video Title",
	description: "Test video description",
	bunnyVideoId: "test-bunny-video-id",
	videoUrl: "https://cdn.test.com/playlist.m3u8",
	thumbnailUrl: "https://cdn.test.com/thumb.jpg",
	duration: 300,
	status: "ready",
	courseId: "test-course-id",
	moduleId: "test-module-id",
	order: 1,
	isPublished: true,
	createdAt: new Date(),
	updatedAt: new Date(),
};

export const sampleLiveStream = {
	_id: "test-live-stream-id",
	title: "Test Live Stream",
	description: "Test live stream description",
	bunnyStreamId: "test-bunny-stream-id",
	rtmpUrl: "rtmp://ingest.bunny.net/live",
	rtmpKey: "test-stream-key",
	playbackUrl: "https://cdn.test.com/live/playlist.m3u8",
	status: "not_started",
	isPublished: false,
	instructorId: "test-admin-id",
	createdAt: new Date(),
	updatedAt: new Date(),
};

export const sampleCourse = {
	_id: "test-course-id",
	title: "Test Course",
	description: "Test course description",
	subject: "Physics",
	target: "JEE",
	level: "intermediate",
	instructor: "test-admin-id",
	isPublished: true,
};

// Create mock functions for Bunny API
export function createBunnyMocks() {
	return {
		createVideo: vi.fn().mockResolvedValue(mockBunnyCreateVideoResponse),
		getVideo: vi.fn().mockResolvedValue(mockBunnyVideo),
		getVideoStatus: vi.fn().mockResolvedValue({
			status: "ready",
			encodeProgress: 100,
			isReady: true,
		}),
		deleteVideo: vi.fn().mockResolvedValue(undefined),
		updateVideo: vi.fn().mockResolvedValue(undefined),
		getPlaybackUrl: vi
			.fn()
			.mockReturnValue("https://cdn.test.com/playlist.m3u8"),
		getThumbnailUrl: vi.fn().mockReturnValue("https://cdn.test.com/thumb.jpg"),
		getEmbedUrl: vi
			.fn()
			.mockReturnValue("https://iframe.mediadelivery.net/embed/123/test"),
		createLiveStream: vi.fn().mockResolvedValue(mockBunnyLiveStream),
		getLiveStreamStatus: vi.fn().mockResolvedValue({
			streamId: "test-live-stream-id",
			name: "Test Live Stream",
			status: "not_started",
			rtmpUrl: "rtmp://ingest.bunny.net/live",
			playbackUrl: "https://cdn.test.com/live/playlist.m3u8",
		}),
		deleteLiveStream: vi.fn().mockResolvedValue(undefined),
	};
}

// Helper to create JSON body
export function jsonBody(data: unknown): string {
	return JSON.stringify(data);
}

// Helper to parse JSON response
export async function parseResponse<T>(response: Response): Promise<T> {
	return (await response.json()) as T;
}
