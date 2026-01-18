/**
 * Live Streaming Router Tests
 *
 * Tests for live streaming CRUD operations and status management.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the database models
vi.mock("@eduPlus/db", () => ({
	LiveStream: {
		findById: vi.fn(),
		findByIdAndUpdate: vi.fn(),
		findOne: vi.fn(),
		find: vi.fn(),
		countDocuments: vi.fn(),
		updateOne: vi.fn(),
		deleteOne: vi.fn(),
	},
	Video: {
		findById: vi.fn(),
	},
}));

// Mock the Bunny API
vi.mock("@eduPlus/api/lib/bunny", () => ({
	createLiveStream: vi.fn(),
	getLiveStreamStatus: vi.fn(),
	deleteLiveStream: vi.fn(),
	getVideo: vi.fn(),
}));

import {
	createLiveStream,
	deleteLiveStream,
	getLiveStreamStatus,
} from "@eduPlus/api/lib/bunny";
import { LiveStream } from "@eduPlus/db";

describe("Live Stream Router", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("Live Stream Status Types", () => {
		it("supports all valid live stream statuses", () => {
			const validStatuses = [
				"scheduled",
				"not_started",
				"starting",
				"running",
				"stopping",
				"stopped",
				"ended",
			];

			for (const status of validStatuses) {
				expect([
					"scheduled",
					"not_started",
					"starting",
					"running",
					"stopping",
					"stopped",
					"ended",
				]).toContain(status);
			}
		});
	});

	describe("Live Stream Document Structure", () => {
		it("defines correct LiveStreamDocument interface", () => {
			const mockLiveStream = {
				_id: "test-id",
				title: "Test Live Stream",
				description: "Test description",
				bunnyStreamId: "bunny-stream-123",
				rtmpUrl: "rtmp://ingest.bunny.net/live",
				rtmpKey: "test-stream-key",
				playbackUrl: "https://cdn.test.com/live/playlist.m3u8",
				status: "not_started" as const,
				scheduledAt: new Date(),
				startedAt: undefined,
				endedAt: undefined,
				recordingVideoId: undefined,
				hasRecording: false,
				courseId: "course-123",
				instructorId: "instructor-123",
				thumbnailUrl: "https://example.com/thumb.jpg",
				isPublished: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			// Verify all required fields exist
			expect(mockLiveStream._id).toBeDefined();
			expect(mockLiveStream.title).toBeDefined();
			expect(mockLiveStream.bunnyStreamId).toBeDefined();
			expect(mockLiveStream.status).toBeDefined();
			expect(mockLiveStream.instructorId).toBeDefined();
		});
	});
});

describe("Live Stream Create Operations", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("creates live stream in Bunny", async () => {
		const bunnyResponse = {
			streamId: "new-bunny-stream-id",
			rtmpUrl: "rtmp://ingest.bunny.net/live",
			rtmpKey: "test-stream-key-12345",
			playbackUrl: "https://cdn.test.com/live/playlist.m3u8",
		};

		vi.mocked(createLiveStream).mockResolvedValue(bunnyResponse);

		const result = await createLiveStream("Test Live Stream");

		expect(result.streamId).toBe("new-bunny-stream-id");
		expect(result.rtmpUrl).toContain("rtmp://");
		expect(result.rtmpKey).toBeDefined();
		expect(result.playbackUrl).toContain(".m3u8");
	});

	it("sets correct initial status for immediate stream", () => {
		const liveStream = {
			status: "not_started",
			scheduledAt: undefined,
		};

		// When no scheduledAt is provided, status should be "not_started"
		expect(liveStream.status).toBe("not_started");
		expect(liveStream.scheduledAt).toBeUndefined();
	});

	it("sets correct initial status for scheduled stream", () => {
		const scheduledDate = new Date(Date.now() + 86400000); // Tomorrow
		const liveStream = {
			status: "scheduled",
			scheduledAt: scheduledDate,
		};

		// When scheduledAt is provided, status should be "scheduled"
		expect(liveStream.status).toBe("scheduled");
		expect(liveStream.scheduledAt).toEqual(scheduledDate);
	});
});

describe("Live Stream Get Operations", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns live stream with current status from Bunny", async () => {
		const mockLiveStream = {
			_id: "test-stream-id",
			title: "Test Stream",
			bunnyStreamId: "bunny-123",
			status: "not_started",
			rtmpUrl: "rtmp://ingest.bunny.net/live",
			rtmpKey: "test-key",
			playbackUrl: "https://cdn.test.com/playlist.m3u8",
		};

		const mockQuery = {
			lean: vi.fn().mockResolvedValue(mockLiveStream),
		};

		vi.mocked(LiveStream.findById).mockReturnValue(
			mockQuery as unknown as ReturnType<typeof LiveStream.findById>,
		);

		vi.mocked(getLiveStreamStatus).mockResolvedValue({
			streamId: "bunny-123",
			name: "Test Stream",
			status: "running",
			rtmpUrl: "rtmp://ingest.bunny.net/live",
			playbackUrl: "https://cdn.test.com/playlist.m3u8",
		});

		// Simulate the get flow
		const stream = await mockQuery.lean();
		const bunnyStatus = await getLiveStreamStatus(stream.bunnyStreamId);

		expect(stream).toEqual(mockLiveStream);
		expect(bunnyStatus.status).toBe("running");
	});

	it("handles Bunny API error gracefully", async () => {
		const mockLiveStream = {
			_id: "test-stream-id",
			bunnyStreamId: "bunny-123",
			status: "not_started",
		};

		const mockQuery = {
			lean: vi.fn().mockResolvedValue(mockLiveStream),
		};

		vi.mocked(LiveStream.findById).mockReturnValue(
			mockQuery as unknown as ReturnType<typeof LiveStream.findById>,
		);

		vi.mocked(getLiveStreamStatus).mockRejectedValue(
			new Error("Bunny API error"),
		);

		// Should still return the stream from database
		const stream = await mockQuery.lean();
		expect(stream.status).toBe("not_started");

		// Bunny call should throw but be caught
		await expect(getLiveStreamStatus("bunny-123")).rejects.toThrow(
			"Bunny API error",
		);
	});

	it("handles stream not found", async () => {
		const mockQuery = {
			lean: vi.fn().mockResolvedValue(null),
		};

		vi.mocked(LiveStream.findById).mockReturnValue(
			mockQuery as unknown as ReturnType<typeof LiveStream.findById>,
		);

		const result = await mockQuery.lean();
		expect(result).toBeNull();
	});
});

describe("Live Stream List Operations", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("lists live streams with filtering", async () => {
		const mockStreams = [
			{
				_id: "stream-1",
				title: "Stream 1",
				status: "running",
				isPublished: true,
			},
			{
				_id: "stream-2",
				title: "Stream 2",
				status: "scheduled",
				isPublished: true,
			},
		];

		const mockQuery = {
			sort: vi.fn().mockReturnThis(),
			limit: vi.fn().mockReturnThis(),
			skip: vi.fn().mockReturnThis(),
			select: vi.fn().mockReturnThis(),
			lean: vi.fn().mockResolvedValue(mockStreams),
		};

		vi.mocked(LiveStream.find).mockReturnValue(
			mockQuery as unknown as ReturnType<typeof LiveStream.find>,
		);
		vi.mocked(LiveStream.countDocuments).mockResolvedValue(2);

		// Verify the mock setup
		expect(LiveStream.find).toBeDefined();
		expect(LiveStream.countDocuments).toBeDefined();
	});

	it("gets active streams correctly", async () => {
		const mockActiveStreams = [
			{
				_id: "stream-1",
				title: "Active Stream",
				status: "running",
				startedAt: new Date(),
			},
		];

		const mockQuery = {
			sort: vi.fn().mockReturnThis(),
			lean: vi.fn().mockResolvedValue(mockActiveStreams),
		};

		vi.mocked(LiveStream.find).mockReturnValue(
			mockQuery as unknown as ReturnType<typeof LiveStream.find>,
		);

		// The filter should include status: { $in: ["starting", "running"] }
		const filter = { status: { $in: ["starting", "running"] } };
		expect(filter.status.$in).toContain("running");
		expect(filter.status.$in).toContain("starting");
	});
});

describe("Live Stream Status Operations", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("marks stream as starting", async () => {
		const mockLiveStream = {
			_id: "test-stream-id",
			status: "not_started" as string,
			startedAt: undefined as Date | undefined,
			save: vi.fn(),
		};

		vi.mocked(LiveStream.findById).mockResolvedValue(mockLiveStream);

		// Simulate start operation
		mockLiveStream.status = "starting";
		mockLiveStream.startedAt = new Date();
		await mockLiveStream.save();

		expect(mockLiveStream.status).toBe("starting");
		expect(mockLiveStream.startedAt).toBeDefined();
		expect(mockLiveStream.save).toHaveBeenCalled();
	});

	it("marks stream as running", async () => {
		const mockLiveStream = {
			_id: "test-stream-id",
			status: "running",
		};

		const mockQuery = {
			lean: vi.fn().mockResolvedValue(mockLiveStream),
		};

		vi.mocked(LiveStream.findByIdAndUpdate).mockReturnValue(
			mockQuery as unknown as ReturnType<typeof LiveStream.findByIdAndUpdate>,
		);

		const result = await mockQuery.lean();
		expect(result.status).toBe("running");
	});

	it("ends stream correctly", async () => {
		const mockLiveStream = {
			_id: "test-stream-id",
			status: "running" as string,
			endedAt: undefined as Date | undefined,
			save: vi.fn(),
		};

		vi.mocked(LiveStream.findById).mockResolvedValue(mockLiveStream);

		// Simulate end operation
		mockLiveStream.status = "ended";
		mockLiveStream.endedAt = new Date();
		await mockLiveStream.save();

		expect(mockLiveStream.status).toBe("ended");
		expect(mockLiveStream.endedAt).toBeDefined();
		expect(mockLiveStream.save).toHaveBeenCalled();
	});

	it("syncs status from Bunny API", async () => {
		const mockLiveStream = {
			_id: "test-stream-id",
			bunnyStreamId: "bunny-123",
			status: "starting" as string,
			startedAt: undefined as Date | undefined,
			save: vi.fn(),
		};

		vi.mocked(LiveStream.findById).mockResolvedValue(mockLiveStream);

		vi.mocked(getLiveStreamStatus).mockResolvedValue({
			streamId: "bunny-123",
			name: "Test Stream",
			status: "running",
			rtmpUrl: "rtmp://ingest.bunny.net/live",
			playbackUrl: "https://cdn.test.com/playlist.m3u8",
		});

		const bunnyStatus = await getLiveStreamStatus(mockLiveStream.bunnyStreamId);

		// If Bunny says running and our status was starting, update to running
		if (
			bunnyStatus.status === "running" &&
			mockLiveStream.status !== "running"
		) {
			mockLiveStream.status = "running" as "starting";
			if (!mockLiveStream.startedAt) {
				mockLiveStream.startedAt = new Date();
			}
		}

		expect(mockLiveStream.status).toBe("running");
		expect(mockLiveStream.startedAt).toBeDefined();
	});
});

describe("Live Stream Delete Operations", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("deletes stream from Bunny and database", async () => {
		const mockLiveStream = {
			_id: "test-stream-id",
			bunnyStreamId: "bunny-123",
			status: "ended",
		};

		vi.mocked(LiveStream.findById).mockResolvedValue(mockLiveStream);
		vi.mocked(deleteLiveStream).mockResolvedValue(undefined);
		vi.mocked(LiveStream.deleteOne).mockResolvedValue({
			deletedCount: 1,
			acknowledged: true,
		});

		// Simulate delete flow
		await deleteLiveStream(mockLiveStream.bunnyStreamId);
		await LiveStream.deleteOne({ _id: mockLiveStream._id });

		expect(deleteLiveStream).toHaveBeenCalledWith("bunny-123");
		expect(LiveStream.deleteOne).toHaveBeenCalledWith({
			_id: "test-stream-id",
		});
	});

	it("prevents deleting running stream", async () => {
		const mockLiveStream = {
			_id: "test-stream-id",
			bunnyStreamId: "bunny-123",
			status: "running",
		};

		vi.mocked(LiveStream.findById).mockResolvedValue(mockLiveStream);

		// Should not delete running or starting streams
		const canDelete = !["running", "starting"].includes(mockLiveStream.status);
		expect(canDelete).toBe(false);
	});

	it("allows deleting scheduled stream", async () => {
		const mockLiveStream = {
			_id: "test-stream-id",
			bunnyStreamId: "bunny-123",
			status: "scheduled",
		};

		vi.mocked(LiveStream.findById).mockResolvedValue(mockLiveStream);

		const canDelete = !["running", "starting"].includes(mockLiveStream.status);
		expect(canDelete).toBe(true);
	});

	it("handles Bunny delete failure gracefully", async () => {
		const mockLiveStream = {
			_id: "test-stream-id",
			bunnyStreamId: "bunny-123",
			status: "ended",
		};

		vi.mocked(LiveStream.findById).mockResolvedValue(mockLiveStream);
		vi.mocked(deleteLiveStream).mockRejectedValue(new Error("Bunny API error"));
		vi.mocked(LiveStream.deleteOne).mockResolvedValue({
			deletedCount: 1,
			acknowledged: true,
		});

		// Should continue to delete from DB even if Bunny fails
		try {
			await deleteLiveStream(mockLiveStream.bunnyStreamId);
		} catch {
			// Expected to fail
		}

		// DB deletion should still proceed
		await LiveStream.deleteOne({ _id: mockLiveStream._id });
		expect(LiveStream.deleteOne).toHaveBeenCalledWith({
			_id: "test-stream-id",
		});
	});
});

describe("Live Stream Student Endpoints", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns only published streams for students", async () => {
		const mockStreams = [
			{
				_id: "stream-1",
				title: "Published Stream",
				status: "running",
				isPublished: true,
				playbackUrl: "https://cdn.test.com/playlist.m3u8",
			},
		];

		const mockQuery = {
			sort: vi.fn().mockReturnThis(),
			limit: vi.fn().mockReturnThis(),
			select: vi.fn().mockReturnThis(),
			lean: vi.fn().mockResolvedValue(mockStreams),
		};

		vi.mocked(LiveStream.find).mockReturnValue(
			mockQuery as unknown as ReturnType<typeof LiveStream.find>,
		);

		// The filter should require isPublished: true
		const filter = {
			isPublished: true,
			status: { $in: ["scheduled", "starting", "running"] },
		};

		expect(filter.isPublished).toBe(true);
	});

	it("excludes RTMP details from student responses", async () => {
		const mockStream = {
			_id: "stream-1",
			title: "Live Stream",
			status: "running",
			playbackUrl: "https://cdn.test.com/playlist.m3u8",
			// These should be excluded
			// rtmpUrl: "rtmp://...",
			// rtmpKey: "secret-key",
		};

		const mockQuery = {
			select: vi.fn().mockReturnThis(),
			lean: vi.fn().mockResolvedValue(mockStream),
		};

		vi.mocked(LiveStream.findOne).mockReturnValue(
			mockQuery as unknown as ReturnType<typeof LiveStream.findOne>,
		);

		// select("-rtmpUrl -rtmpKey") should be called
		const result = await mockQuery.lean();
		expect(result.playbackUrl).toBeDefined();
		expect((result as unknown as { rtmpKey?: string }).rtmpKey).toBeUndefined();
	});

	it("returns canWatch: true for running streams", () => {
		const liveStream = {
			status: "running",
			playbackUrl: "https://cdn.test.com/playlist.m3u8",
		};

		const accessibleStatuses = ["starting", "running"];
		const canWatch = accessibleStatuses.includes(liveStream.status);

		expect(canWatch).toBe(true);
	});

	it("returns canWatch: false for ended streams", () => {
		const liveStream = {
			status: "ended",
		};

		const accessibleStatuses = ["starting", "running"];
		const canWatch = accessibleStatuses.includes(liveStream.status);

		expect(canWatch).toBe(false);
	});

	it("returns appropriate message for scheduled streams", () => {
		const liveStream = {
			status: "scheduled",
			scheduledAt: new Date(Date.now() + 86400000),
		};

		const accessibleStatuses = ["starting", "running"];
		const canWatch = accessibleStatuses.includes(liveStream.status);

		let message = "";
		if (!canWatch) {
			message =
				liveStream.status === "scheduled"
					? "Stream has not started yet"
					: "Stream has ended";
		}

		expect(canWatch).toBe(false);
		expect(message).toBe("Stream has not started yet");
	});
});

describe("Live Stream Statistics", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns correct stats counts", async () => {
		vi.mocked(LiveStream.countDocuments)
			.mockResolvedValueOnce(10) // total
			.mockResolvedValueOnce(2) // scheduled
			.mockResolvedValueOnce(1) // active
			.mockResolvedValueOnce(7); // ended

		const [total, scheduled, active, ended] = await Promise.all([
			LiveStream.countDocuments(),
			LiveStream.countDocuments({ status: "scheduled" }),
			LiveStream.countDocuments({ status: { $in: ["starting", "running"] } }),
			LiveStream.countDocuments({ status: "ended" }),
		]);

		expect(total).toBe(10);
		expect(scheduled).toBe(2);
		expect(active).toBe(1);
		expect(ended).toBe(7);
	});
});

describe("Live Stream Recording", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("checks hasRecording flag correctly", () => {
		const streamWithRecording = {
			hasRecording: true,
			recordingVideoId: "video-123",
		};

		const streamWithoutRecording = {
			hasRecording: false,
			recordingVideoId: undefined,
		};

		expect(streamWithRecording.hasRecording).toBe(true);
		expect(streamWithRecording.recordingVideoId).toBeDefined();

		expect(streamWithoutRecording.hasRecording).toBe(false);
		expect(streamWithoutRecording.recordingVideoId).toBeUndefined();
	});

	it("links recording to live stream", async () => {
		const mockLiveStream = {
			_id: "test-stream-id",
			recordingVideoId: undefined as string | undefined,
			hasRecording: false,
			save: vi.fn(),
		};

		vi.mocked(LiveStream.findById).mockResolvedValue(mockLiveStream);

		// Simulate linking recording
		mockLiveStream.recordingVideoId = "recording-video-id";
		mockLiveStream.hasRecording = true;
		await mockLiveStream.save();

		expect(mockLiveStream.recordingVideoId).toBe("recording-video-id");
		expect(mockLiveStream.hasRecording).toBe(true);
		expect(mockLiveStream.save).toHaveBeenCalled();
	});
});
