import { config } from "dotenv";
import mongoose from "mongoose";
import { Course, DPP, Note, Video } from "../packages/db/src/index";

// Connect to database
async function connectDB() {
	try {
		// Load server environment variables
		config({ path: "apps/server/.env" });
		console.log("DATABASE_URL:", process.env.DATABASE_URL);
		if (!process.env.DATABASE_URL) {
			throw new Error("DATABASE_URL not found in environment variables");
		}
		await mongoose.connect(process.env.DATABASE_URL);
		console.log("✅ Connected to database");
	} catch (error) {
		console.error("❌ Error connecting to database:", error);
		process.exit(1);
	}
}

// Mock courses data
const courses = [
	{
		id: "react-basics",
		title: "React Basics",
		image:
			"https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80",
		durationMinutes: 180,
		description:
			"Learn core React concepts including components, state, and hooks.",
		instructor: "Jane Doe",
		lessons: [
			{ id: "rb-1", title: "JSX and Components", durationMinutes: 30 },
			{ id: "rb-2", title: "Props and State", durationMinutes: 30 },
			{ id: "rb-3", title: "Hooks Overview", durationMinutes: 45 },
			{ id: "rb-4", title: "Effects and Lifecycle", durationMinutes: 45 },
			{ id: "rb-5", title: "Project Setup", durationMinutes: 30 },
		],
	},
	{
		id: "ts-advanced",
		title: "TypeScript Advanced",
		image:
			"https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
		durationMinutes: 240,
		description:
			"Deep-dive into TypeScript generics, utility types, and inference.",
		instructor: "Alex Kim",
		lessons: [
			{ id: "ts-1", title: "Generics", durationMinutes: 40 },
			{ id: "ts-2", title: "Utility Types", durationMinutes: 40 },
			{ id: "ts-3", title: "Type Narrowing", durationMinutes: 40 },
			{ id: "ts-4", title: "Mapped Types", durationMinutes: 60 },
			{ id: "ts-5", title: "Advanced Inference", durationMinutes: 60 },
		],
	},
];

async function seedDatabase() {
	console.log("🌱 Starting database seeding...");

	await connectDB();

	try {
		// Clear existing data
		await Promise.all([
			Course.deleteMany({}),
			Video.deleteMany({}),
			Note.deleteMany({}),
			DPP.deleteMany({}),
		]);

		console.log("🧹 Cleared existing data");

		// Seed courses
		const seededCourses = [];
		for (const courseData of courses) {
			const course = new Course({
				_id: courseData.id,
				title: courseData.title,
				description: courseData.description,
				thumbnail: courseData.image,
				subject: "General", // Default subject
				target: "General", // Default target
				level: "beginner" as const,
				instructor: courseData.instructor,
				isPublished: true,
			});

			await course.save();
			seededCourses.push(course);
			console.log(`✅ Created course: ${course.title}`);
		}

		// Seed videos for each course
		for (const course of seededCourses) {
			const courseData = courses.find((c) => c.id === course._id);
			if (!courseData) continue;

			for (let i = 0; i < courseData.lessons.length; i++) {
				const lesson = courseData.lessons[i];
				const video = new Video({
					_id: lesson.id,
					title: lesson.title,
					description: `Video for ${lesson.title}`,
					youtubeVideoId: "dQw4w9WgXcQ", // Default YouTube video ID (Rick Roll for demo)
					duration: lesson.durationMinutes * 60, // Convert to seconds
					courseId: course._id,
					order: i,
					isPublished: true,
				});

				await video.save();
				console.log(
					`🎥 Created video: ${video.title} for course: ${course.title}`,
				);
			}
		}

		// Seed sample notes
		for (const course of seededCourses) {
			const note = new Note({
				_id: `note-${course._id}`,
				title: `${course.title} - Study Notes`,
				content: `# ${course.title}\n\nThis is a sample note for the ${course.title} course.\n\n## Key Concepts\n\n- Concept 1\n- Concept 2\n- Concept 3\n\n## Practice Problems\n\n1. Problem 1\n2. Problem 2`,
				courseId: course._id,
				order: 0,
				isPublished: true,
			});

			await note.save();
			console.log(`📝 Created note for course: ${course.title}`);
		}

		// Seed sample DPP
		for (const course of seededCourses) {
			const dpp = new DPP({
				_id: `dpp-${course._id}`,
				title: `${course.title} - Daily Practice Problems`,
				description: `Practice problems for ${course.title}`,
				courseId: course._id,
				date: new Date(),
				subject: course.subject,
				target: course.target,
				questions: [
					{
						questionText: "Sample Question 1?",
						options: [
							{ text: "Option A" },
							{ text: "Option B" },
							{ text: "Option C" },
							{ text: "Option D" },
						],
						correctAnswer: 0,
						marks: 4,
						explanation: "This is the correct answer because...",
					},
					{
						questionText: "Sample Question 2?",
						options: [
							{ text: "Option A" },
							{ text: "Option B" },
							{ text: "Option C" },
							{ text: "Option D" },
						],
						correctAnswer: 1,
						marks: 4,
						explanation: "This is the correct answer because...",
					},
				],
				isPublished: true,
			});

			await dpp.save();
			console.log(`📋 Created DPP for course: ${course.title}`);
		}

		console.log("🎉 Database seeding completed successfully!");
		console.log("📊 Summary:");
		console.log(`   - Courses: ${seededCourses.length}`);
		console.log(`   - Videos: ${await Video.countDocuments()}`);
		console.log(`   - Notes: ${await Note.countDocuments()}`);
		console.log(`   - DPPs: ${await DPP.countDocuments()}`);
	} catch (error) {
		console.error("❌ Error seeding database:", error);
		process.exit(1);
	}
}

// Run the seed function
seedDatabase()
	.then(async () => {
		console.log("🏁 Seeding process finished");
		await mongoose.disconnect();
		process.exit(0);
	})
	.catch(async (error) => {
		console.error("💥 Seeding failed:", error);
		await mongoose.disconnect();
		process.exit(1);
	});
