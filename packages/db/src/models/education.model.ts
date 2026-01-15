import mongoose from "mongoose";

const { Schema, model } = mongoose;

/* -------------------------------------------------------------------------- */
/*                                   COURSE                                   */
/* -------------------------------------------------------------------------- */

const courseSchema = new Schema(
	{
		_id: { type: String }, // UUID or nanoid recommended
		title: { type: String, required: true },
		description: { type: String, required: true },
		thumbnail: { type: String },

		subject: { type: String, required: true, index: true },
		target: { type: String, required: true, index: true }, // JEE, NEET etc.
		level: {
			type: String,
			enum: ["beginner", "intermediate", "advanced"],
			required: true,
		},

		instructor: { type: String, ref: "User", required: true },
		isPublished: { type: Boolean, default: false },
	},
	{ timestamps: true, collection: "course" },
);

/* -------------------------------------------------------------------------- */
/*                                    VIDEO                                   */
/* -------------------------------------------------------------------------- */

const videoSchema = new Schema(
	{
		_id: { type: String },

		title: { type: String, required: true },
		description: { type: String },

		// Bunny Stream fields
		bunnyVideoId: { type: String }, // Bunny Stream video GUID
		videoUrl: { type: String }, // HLS playback URL
		thumbnailUrl: { type: String }, // Auto-generated thumbnail
		duration: { type: Number }, // in seconds
		status: {
			type: String,
			enum: ["pending", "uploading", "processing", "ready", "error"],
			default: "pending",
		},

		// Live streaming fields
		isLive: { type: Boolean, default: false },
		liveStreamId: { type: String }, // Bunny live stream ID

		// Video metadata (populated after encoding)
		metadata: {
			width: { type: Number },
			height: { type: Number },
			framerate: { type: Number },
			fileSize: { type: Number }, // in bytes
			availableResolutions: [{ type: String }], // e.g., ["1080p", "720p", "480p"]
		},

		// Legacy YouTube field (for migration)
		youtubeVideoId: { type: String },

		courseId: { type: String, ref: "Course", required: true, index: true },
		moduleId: { type: String, ref: "Module", index: true },

		order: { type: Number, default: 0, index: true },
		isPublished: { type: Boolean, default: false },
	},
	{ timestamps: true, collection: "video" },
);

/* -------------------------------------------------------------------------- */
/*                                     NOTE                                   */
/* -------------------------------------------------------------------------- */

const noteSchema = new Schema(
	{
		_id: { type: String },

		title: { type: String, required: true },
		content: { type: String, required: true }, // rich text
		fileUrl: { type: String },

		courseId: { type: String, ref: "Course", required: true, index: true },
		moduleId: { type: String, ref: "Module", index: true },
		videoId: { type: String, ref: "Video" },

		order: { type: Number, default: 0, index: true },
		isPublished: { type: Boolean, default: false },
	},
	{ timestamps: true, collection: "note" },
);

/* -------------------------------------------------------------------------- */
/*                                     TEST                                   */
/* -------------------------------------------------------------------------- */

const testSchema = new Schema(
	{
		_id: { type: String },

		title: { type: String, required: true },
		description: String,

		courseId: { type: String, ref: "Course", index: true },
		subject: { type: String, required: true },
		target: { type: String, required: true },

		duration: { type: Number, required: true }, // minutes
		totalMarks: { type: Number, required: true },

		questions: [
			{
				questionText: { type: String, required: true },
				questionImage: String,
				options: [
					{
						text: { type: String, required: true },
						image: String,
					},
				],
				correctAnswer: { type: Number, required: true },
				marks: { type: Number, required: true },
				negativeMarks: { type: Number, default: 0 },
				explanation: String,
			},
		],

		isPublished: { type: Boolean, default: false },
	},
	{ timestamps: true, collection: "test" },
);

/* -------------------------------------------------------------------------- */
/*                                     DPP                                    */
/* -------------------------------------------------------------------------- */

const dppSchema = new Schema(
	{
		_id: { type: String },

		title: { type: String, required: true },
		description: String,

		courseId: { type: String, ref: "Course", required: true, index: true },
		moduleId: { type: String, ref: "Module", index: true },

		date: { type: Date, required: true },
		subject: { type: String, required: true },
		target: { type: String, required: true },

		questions: [
			{
				questionText: { type: String, required: true },
				questionImage: String,
				options: [
					{
						text: { type: String, required: true },
						image: String,
					},
				],
				correctAnswer: { type: Number, required: true },
				marks: { type: Number, required: true },
				explanation: String,
			},
		],

		isPublished: { type: Boolean, default: false },
	},
	{ timestamps: true, collection: "dpp" },
);

/* -------------------------------------------------------------------------- */
/*                                 LIVE STREAM                                */
/* -------------------------------------------------------------------------- */

const liveStreamSchema = new Schema(
	{
		_id: { type: String },

		title: { type: String, required: true },
		description: { type: String },

		// Bunny Stream live stream fields
		bunnyStreamId: { type: String, required: true, unique: true }, // Bunny live stream ID
		rtmpUrl: { type: String }, // RTMP ingest URL
		rtmpKey: { type: String }, // RTMP stream key (sensitive - for admin only)
		playbackUrl: { type: String }, // HLS playback URL

		// Stream status
		status: {
			type: String,
			enum: [
				"scheduled",
				"not_started",
				"starting",
				"running",
				"stopping",
				"stopped",
				"ended",
			],
			default: "not_started",
		},

		// Schedule
		scheduledAt: { type: Date }, // When the stream is scheduled to start
		startedAt: { type: Date }, // When the stream actually started
		endedAt: { type: Date }, // When the stream ended

		// Recording (auto-saved after stream ends)
		recordingVideoId: { type: String, ref: "Video" }, // Reference to saved recording
		hasRecording: { type: Boolean, default: false },

		// Association
		courseId: { type: String, ref: "Course", index: true },
		instructorId: { type: String, ref: "User", required: true },

		// Thumbnail
		thumbnailUrl: { type: String },

		// Visibility
		isPublished: { type: Boolean, default: false },
	},
	{ timestamps: true, collection: "livestream" },
);

// Index for finding active/upcoming streams
liveStreamSchema.index({ status: 1, scheduledAt: 1 });
liveStreamSchema.index({ instructorId: 1, status: 1 });

/* -------------------------------------------------------------------------- */

export const Course = model("Course", courseSchema);
export const Video = model("Video", videoSchema);
export const Note = model("Note", noteSchema);
export const Test = model("Test", testSchema);
export const DPP = model("DPP", dppSchema);
export const LiveStream = model("LiveStream", liveStreamSchema);
