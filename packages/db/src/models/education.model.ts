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
		youtubeVideoId: { type: String, required: true }, // ex: dQw4w9WgXcQ
		duration: { type: Number }, // in seconds

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

export const Course = model("Course", courseSchema);
export const Video = model("Video", videoSchema);
export const Note = model("Note", noteSchema);
export const Test = model("Test", testSchema);
export const DPP = model("DPP", dppSchema);
