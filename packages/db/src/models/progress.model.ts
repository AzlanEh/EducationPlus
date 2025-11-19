import mongoose from "mongoose";

const { Schema, model } = mongoose;

const courseProgressSchema = new Schema(
	{
		_id: { type: String },
		userId: { type: String, ref: "User", required: true },
		courseId: { type: String, ref: "Course", required: true },
		enrolledAt: { type: Date, default: Date.now },
		lastAccessedAt: { type: Date, default: Date.now },
		completionPercentage: { type: Number, default: 0 },
		isCompleted: { type: Boolean, default: false },
		completedAt: { type: Date },
	},
	{ collection: "courseProgress" },
);

courseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const videoProgressSchema = new Schema(
	{
		_id: { type: String },
		userId: { type: String, ref: "User", required: true },
		videoId: { type: String, ref: "Video", required: true },
		courseId: { type: String, ref: "Course", required: true },
		watchedDuration: { type: Number, default: 0 }, // Duration in seconds
		isCompleted: { type: Boolean, default: false },
		lastWatchedAt: { type: Date, default: Date.now },
		completedAt: { type: Date },
	},
	{ collection: "videoProgress" },
);

videoProgressSchema.index({ userId: 1, videoId: 1 }, { unique: true });

const testAttemptSchema = new Schema(
	{
		_id: { type: String },
		userId: { type: String, ref: "User", required: true },
		testId: { type: String, ref: "Test", required: true },
		courseId: { type: String, ref: "Course" },
		startedAt: { type: Date, required: true },
		submittedAt: { type: Date },
		timeSpent: { type: Number }, // Time in seconds
		score: { type: Number, required: true },
		totalMarks: { type: Number, required: true },
		percentage: { type: Number, required: true },
		answers: [
			{
				questionIndex: { type: Number, required: true },
				selectedAnswer: { type: Number, required: true },
				isCorrect: { type: Boolean, required: true },
				marksObtained: { type: Number, required: true },
				timeTaken: { type: Number }, // Time in seconds
			},
		],
		isCompleted: { type: Boolean, default: false },
		rank: { type: Number },
	},
	{ collection: "testAttempt" },
);

testAttemptSchema.index({ userId: 1, testId: 1 });

const dppAttemptSchema = new Schema(
	{
		_id: { type: String },
		userId: { type: String, ref: "User", required: true },
		dppId: { type: String, ref: "DPP", required: true },
		courseId: { type: String, ref: "Course", required: true },
		attemptedAt: { type: Date, default: Date.now },
		submittedAt: { type: Date },
		score: { type: Number, required: true },
		totalMarks: { type: Number, required: true },
		percentage: { type: Number, required: true },
		answers: [
			{
				questionIndex: { type: Number, required: true },
				selectedAnswer: { type: Number, required: true },
				isCorrect: { type: Boolean, required: true },
				marksObtained: { type: Number, required: true },
			},
		],
		isCompleted: { type: Boolean, default: false },
	},
	{ collection: "dppAttempt" },
);

dppAttemptSchema.index({ userId: 1, dppId: 1 });

const noteAccessSchema = new Schema(
	{
		_id: { type: String },
		userId: { type: String, ref: "User", required: true },
		noteId: { type: String, ref: "Note", required: true },
		courseId: { type: String, ref: "Course", required: true },
		accessedAt: { type: Date, default: Date.now },
		isDownloaded: { type: Boolean, default: false },
		downloadedAt: { type: Date },
	},
	{ collection: "noteAccess" },
);

noteAccessSchema.index({ userId: 1, noteId: 1 });

const studyStreakSchema = new Schema(
	{
		_id: { type: String },
		userId: { type: String, ref: "User", required: true, unique: true },
		currentStreak: { type: Number, default: 0 },
		longestStreak: { type: Number, default: 0 },
		lastStudyDate: { type: Date },
		studyDates: [{ type: Date }],
		totalStudyDays: { type: Number, default: 0 },
	},
	{ collection: "studyStreak" },
);

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
