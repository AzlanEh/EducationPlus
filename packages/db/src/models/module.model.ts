import { model, Schema } from "mongoose";

export interface IModule {
	_id: string;
	title: string;
	description?: string;
	courseId: string;
	order: number;
	isPublished: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const moduleSchema = new Schema<IModule>(
	{
		_id: { type: String, required: true },
		title: { type: String, required: true, trim: true },
		description: { type: String, trim: true },
		courseId: { type: String, required: true, index: true, ref: "Course" },
		order: { type: Number, default: 0, index: true },
		isPublished: { type: Boolean, default: false },
	},
	{
		timestamps: true,
		minimize: false,
	},
);

// Add index for compound query if needed (e.g., modules within a course by order)
moduleSchema.index({ courseId: 1, order: 1 });

export const Module = model<IModule>("Module", moduleSchema);
