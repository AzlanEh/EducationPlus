import mongoose from "mongoose";

const { Schema, model } = mongoose;

const courseSchema = new Schema(
	{
		_id: { type: String },
		title: { type: String, required: true },
		description: { type: String, required: true },
		thumbnail: { type: String },
		subject: { type: String, required: true },
		target: { type: String, required: true }, // JEE, NEET, etc.
		level: { type: String, enum: ["beginner", "intermediate", "advanced"], required: true },
		instructor: { type: String, ref: "User", required: true },
		isPublished: { type: Boolean, default: false },
		createdAt: { type: Date, default: Date.now },
		updatedAt: { type: Date, default: Date.now },
	},
	{ collection: "course" },
);

const videoSchema = new Schema(
	{
		_id: { type: String },
		title: { type: String, required: true },
		description: { type: String },
		youtubeVideoId: { type: String, required: true },
		duration: { type: Number }, // Duration in seconds
		courseId: { type: String, ref: "Course", required: true },
		order: { type: Number, required: true },
		isPublished: { type: Boolean, default: false },
		createdAt: { type: Date, default: Date.now },
		updatedAt: { type: Date, default: Date.now },
	},
	{ collection: "video" },
);

const noteSchema = new Schema(
	{
		_id: { type: String },
		title: { type: String, required: true },
		content: { type: String, required: true },
		fileUrl: { type: String },
		courseId: { type: String, ref: "Course", required: true },
		videoId: { type: String, ref: "Video" },
		order: { type: Number, required: true },
		isPublished: { type: Boolean, default: false },
		createdAt: { type: Date, default: Date.now },
		updatedAt: { type: Date, default: Date.now },
	},
	{ collection: "note" },
);

const testSchema = new Schema(
	{
		_id: { type: String },
		title: { type: String, required: true },
		description: { type: String },
		courseId: { type: String, ref: "Course" },
		subject: { type: String, required: true },
		target: { type: String, required: true },
		duration: { type: Number, required: true }, // Duration in minutes
		totalMarks: { type: Number, required: true },
		questions: [
			{
				questionText: { type: String, required: true },
				questionImage: { type: String },
				options: [
					{
						text: { type: String, required: true },
						image: { type: String },
					},
				],
				correctAnswer: { type: Number, required: true }, // Index of correct option
				marks: { type: Number, required: true },
				negativeMarks: { type: Number, default: 0 },
				explanation: { type: String },
			},
		],
		isPublished: { type: Boolean, default: false },
		createdAt: { type: Date, default: Date.now },
		updatedAt: { type: Date, default: Date.now },
	},
	{ collection: "test" },
);

const dppSchema = new Schema(
	{
		_id: { type: String },
		title: { type: String, required: true },
		description: { type: String },
		courseId: { type: String, ref: "Course", required: true },
		date: { type: Date, required: true },
		subject: { type: String, required: true },
		target: { type: String, required: true },
		questions: [
			{
				questionText: { type: String, required: true },
				questionImage: { type: String },
				options: [
					{
						text: { type: String, required: true },
						image: { type: String },
					},
				],
				correctAnswer: { type: Number, required: true },
				marks: { type: Number, required: true },
				explanation: { type: String },
			},
		],
		isPublished: { type: Boolean, default: false },
		createdAt: { type: Date, default: Date.now },
		updatedAt: { type: Date, default: Date.now },
	},
	{ collection: "dpp" },
);

const Course = model("Course", courseSchema);
const Video = model("Video", videoSchema);
const Note = model("Note", noteSchema);
const Test = model("Test", testSchema);
const DPP = model("DPP", dppSchema);

export { Course, Video, Note, Test, DPP };
