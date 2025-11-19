import mongoose from "mongoose";

const { Schema, model } = mongoose;

const courseProgressSchema = new Schema(
	{
		_id: String,
		userId: { type: String, ref: "User", required: true },
		courseId: { type: String, ref: "Course", required: true },

		// Denormalized for dashboard speed
		courseTitle: String,
		target: String,

		enrolledAt: { type: Date, default: Date.now },
		lastAccessedAt: { type: Date, default: Date.now },

		completionPercentage: { type: Number, default: 0 },
		isCompleted: { type: Boolean, default: false },
		completedAt: { type: Date },
	},
	{ timestamps: true, collection: "courseProgress" },
);

courseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });
courseProgressSchema.index({ courseId: 1 });
courseProgressSchema.index({ userId: 1 });

const videoProgressSchema = new Schema(
	{
		_id: String,
		userId: { type: String, ref: "User", required: true },
		videoId: { type: String, ref: "Video", required: true },
		courseId: { type: String, ref: "Course", required: true },

		// Denormalized
		videoTitle: String,
		courseTitle: String,

		watchedDuration: { type: Number, default: 0 },
		isCompleted: { type: Boolean, default: false },
		lastWatchedAt: { type: Date, default: Date.now },
		completedAt: Date,
	},
	{ timestamps: true, collection: "videoProgress" },
);

videoProgressSchema.index({ userId: 1, videoId: 1 }, { unique: true });
videoProgressSchema.index({ courseId: 1 });
videoProgressSchema.index({ userId: 1 });
videoProgressSchema.index({ isCompleted: 1 });

const testAttemptSchema = new Schema(
	{
		_id: String,
		userId: { type: String, ref: "User", required: true },
		testId: { type: String, ref: "Test", required: true },
		courseId: { type: String, ref: "Course" },

		// Denormalized
		testTitle: String,
		subject: String,
		target: String,

		startedAt: { type: Date, required: true },
		submittedAt: Date,
		timeSpent: Number,

		score: { type: Number, required: true },
		totalMarks: { type: Number, required: true },
		percentage: { type: Number, required: true },
		rank: Number,

		answers: [
			{
				questionIndex: Number,
				selectedAnswer: Number,
				isCorrect: Boolean,
				marksObtained: Number,
				timeTaken: Number,
			},
		],

		isCompleted: { type: Boolean, default: false },
	},
	{ timestamps: true, collection: "testAttempt" },
);

testAttemptSchema.index({ userId: 1, testId: 1 });
testAttemptSchema.index({ testId: 1 });
testAttemptSchema.index({ percentage: -1 }); // leaderboard

const dppAttemptSchema = new Schema(
	{
		_id: String,
		userId: { type: String, ref: "User", required: true },
		dppId: { type: String, ref: "DPP", required: true },
		courseId: { type: String, ref: "Course", required: true },

		// denormalized
		subject: String,
		target: String,

		attemptedAt: { type: Date, default: Date.now },
		submittedAt: Date,

		score: { type: Number, required: true },
		totalMarks: { type: Number, required: true },
		percentage: { type: Number, required: true },

		answers: [
			{
				questionIndex: Number,
				selectedAnswer: Number,
				isCorrect: Boolean,
				marksObtained: Number,
			},
		],

		isCompleted: { type: Boolean, default: false },
	},
	{ timestamps: true, collection: "dppAttempt" },
);

dppAttemptSchema.index({ userId: 1, dppId: 1 });
dppAttemptSchema.index({ courseId: 1 });
dppAttemptSchema.index({ percentage: -1 });

const noteAccessSchema = new Schema(
	{
		_id: String,
		userId: { type: String, ref: "User", required: true },
		noteId: { type: String, ref: "Note", required: true },
		courseId: { type: String, ref: "Course", required: true },

		// Denormalized
		noteTitle: String,
		courseTitle: String,

		accessedAt: { type: Date, default: Date.now },
		isDownloaded: { type: Boolean, default: false },
		downloadedAt: Date,
	},
	{ timestamps: true, collection: "noteAccess" },
);

noteAccessSchema.index({ userId: 1, noteId: 1 });
noteAccessSchema.index({ courseId: 1 });
noteAccessSchema.index({ accessedAt: -1 });

const studyStreakSchema = new Schema(
	{
		_id: String,
		userId: { type: String, ref: "User", required: true, unique: true },

		currentStreak: { type: Number, default: 0 },
		longestStreak: { type: Number, default: 0 },

		lastStudyDate: Date,
		studyDates: [Date],
		totalStudyDays: { type: Number, default: 0 },
	},
	{ timestamps: true, collection: "studyStreak" },
);

studyStreakSchema.index({ userId: 1 });

const CourseProgress = model("CourseProgress", courseProgressSchema);
const VideoProgress = model("VideoProgress", videoProgressSchema);
const TestAttempt = model("TestAttempt", testAttemptSchema);
const DPPAttempt = model("DPPAttempt", dppAttemptSchema);
const NoteAccess = model("NoteAccess", noteAccessSchema);
const StudyStreak = model("StudyStreak", studyStreakSchema);

export {
	CourseProgress,
	VideoProgress,
	TestAttempt,
	DPPAttempt,
	NoteAccess,
	StudyStreak,
};
