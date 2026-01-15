import {
	Course,
	CourseProgress,
	DPP,
	DPPAttempt,
	Module,
	Note,
	NoteAccess,
	StudyStreak,
	Video,
	VideoProgress,
} from "@eduPlus/db";
import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../../index";
import { getEmbedUrl, getPlaybackUrl, getThumbnailUrl } from "../../lib/bunny";

export const studentRouter = {
	// ============== COURSE DISCOVERY ==============

	// Get all published courses (public - for discovery)
	getPublishedCourses: publicProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).default(20),
				offset: z.number().min(0).default(0),
				subject: z.string().optional(),
				target: z.string().optional(),
				level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
				search: z.string().optional(),
			}),
		)
		.handler(async ({ input }) => {
			const { limit, offset, subject, target, level, search } = input;
			const filter: Record<string, unknown> = { isPublished: true };

			if (subject) filter.subject = subject;
			if (target) filter.target = target;
			if (level) filter.level = level;
			if (search) {
				filter.$or = [
					{ title: { $regex: search, $options: "i" } },
					{ description: { $regex: search, $options: "i" } },
				];
			}

			const courses = await Course.find(filter)
				.sort({ createdAt: -1 })
				.limit(limit)
				.skip(offset)
				.lean();

			const total = await Course.countDocuments(filter);

			return { courses, total };
		}),

	// Get single course details with modules (public)
	getCourseDetails: publicProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input }) => {
			const course = await Course.findOne({
				_id: input.id,
				isPublished: true,
			}).lean();

			if (!course) {
				throw new Error("Course not found");
			}

			// Get modules for this course
			const modules = await Module.find({
				courseId: input.id,
				isPublished: true,
			})
				.sort({ order: 1 })
				.lean();

			// Get video count and note count
			const [videoCount, noteCount, dppCount] = await Promise.all([
				Video.countDocuments({ courseId: input.id, isPublished: true }),
				Note.countDocuments({ courseId: input.id, isPublished: true }),
				DPP.countDocuments({ courseId: input.id, isPublished: true }),
			]);

			return {
				...course,
				modules,
				stats: { videoCount, noteCount, dppCount },
			};
		}),

	// Get featured courses for home screen
	getFeaturedCourses: publicProcedure
		.input(z.object({ limit: z.number().min(1).max(10).default(5) }))
		.handler(async ({ input }) => {
			// Get most recent published courses as featured
			const courses = await Course.find({ isPublished: true })
				.sort({ createdAt: -1 })
				.limit(input.limit)
				.lean();

			return { courses };
		}),

	// ============== COURSE CONTENT (Protected) ==============

	// Get videos for a course
	getCourseVideos: protectedProcedure
		.input(
			z.object({
				courseId: z.string(),
				moduleId: z.string().optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			const filter: Record<string, unknown> = {
				courseId: input.courseId,
				isPublished: true,
			};
			if (input.moduleId) filter.moduleId = input.moduleId;

			const videos = await Video.find(filter).sort({ order: 1 }).lean();

			// Get user's progress for these videos
			const userId = context.session?.user?.id;
			let progressMap: Record<string, boolean> = {};

			if (userId) {
				const progress = await VideoProgress.find({
					userId,
					courseId: input.courseId,
				}).lean();
				progressMap = progress.reduce(
					(acc, p) => {
						acc[p.videoId as string] = p.isCompleted;
						return acc;
					},
					{} as Record<string, boolean>,
				);
			}

			return {
				videos: videos.map((v) => {
					// Include Bunny playback URLs if video has bunnyVideoId and is ready
					const hasBunnyVideo = v.bunnyVideoId && v.status === "ready";
					return {
						...v,
						isCompleted: progressMap[v._id as string] || false,
						// Bunny playback URLs (only if video is ready)
						playbackUrl: hasBunnyVideo ? getPlaybackUrl(v.bunnyVideoId!) : null,
						thumbnailUrl: hasBunnyVideo
							? getThumbnailUrl(v.bunnyVideoId!)
							: v.thumbnailUrl || null,
						embedUrl: hasBunnyVideo ? getEmbedUrl(v.bunnyVideoId!) : null,
					};
				}),
			};
		}),

	// Get single video details
	getVideo: protectedProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input, context }) => {
			const video = await Video.findOne({
				_id: input.id,
				isPublished: true,
			}).lean();

			if (!video) {
				throw new Error("Video not found");
			}

			// Get user's progress
			const userId = context.session?.user?.id;
			let progress = null;

			if (userId) {
				progress = await VideoProgress.findOne({
					userId,
					videoId: input.id,
				}).lean();
			}

			// Include Bunny playback URLs if video has bunnyVideoId and is ready
			const hasBunnyVideo = video.bunnyVideoId && video.status === "ready";

			return {
				video: {
					...video,
					// Bunny playback URLs (only if video is ready)
					playbackUrl: hasBunnyVideo
						? getPlaybackUrl(video.bunnyVideoId!)
						: null,
					thumbnailUrl: hasBunnyVideo
						? getThumbnailUrl(video.bunnyVideoId!)
						: video.thumbnailUrl || null,
					embedUrl: hasBunnyVideo ? getEmbedUrl(video.bunnyVideoId!) : null,
				},
				progress,
			};
		}),

	// Get notes for a course
	getCourseNotes: protectedProcedure
		.input(
			z.object({
				courseId: z.string(),
				moduleId: z.string().optional(),
			}),
		)
		.handler(async ({ input }) => {
			const filter: Record<string, unknown> = {
				courseId: input.courseId,
				isPublished: true,
			};
			if (input.moduleId) filter.moduleId = input.moduleId;

			const notes = await Note.find(filter).sort({ order: 1 }).lean();

			return { notes };
		}),

	// Get single note details
	getNote: protectedProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input, context }) => {
			const note = await Note.findOne({
				_id: input.id,
				isPublished: true,
			}).lean();

			if (!note) {
				throw new Error("Note not found");
			}

			// Track note access
			const userId = context.session?.user?.id;
			if (userId) {
				await NoteAccess.findOneAndUpdate(
					{ userId, noteId: input.id },
					{
						$set: {
							accessedAt: new Date(),
							courseId: note.courseId,
							noteTitle: note.title,
						},
						$setOnInsert: {
							_id: crypto.randomUUID(),
						},
					},
					{ upsert: true },
				);
			}

			return { note };
		}),

	// Get DPPs for a course
	getCourseDPPs: protectedProcedure
		.input(
			z.object({
				courseId: z.string(),
				moduleId: z.string().optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			const filter: Record<string, unknown> = {
				courseId: input.courseId,
				isPublished: true,
			};
			if (input.moduleId) filter.moduleId = input.moduleId;

			const dpps = await DPP.find(filter)
				.select("-questions.correctAnswer -questions.explanation")
				.sort({ date: -1 })
				.lean();

			// Get user's attempts
			const userId = context.session?.user?.id;
			let attemptsMap: Record<string, { score: number; percentage: number }> =
				{};

			if (userId) {
				const attempts = await DPPAttempt.find({
					userId,
					courseId: input.courseId,
					isCompleted: true,
				}).lean();

				attemptsMap = attempts.reduce(
					(acc, a) => {
						acc[a.dppId as string] = {
							score: a.score,
							percentage: a.percentage,
						};
						return acc;
					},
					{} as Record<string, { score: number; percentage: number }>,
				);
			}

			return {
				dpps: dpps.map((d) => ({
					...d,
					attempt: attemptsMap[d._id as string] || null,
				})),
			};
		}),

	// Get DPP for attempting (includes questions without answers)
	getDPP: protectedProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input }) => {
			const dpp = await DPP.findOne({
				_id: input.id,
				isPublished: true,
			}).lean();

			if (!dpp) {
				throw new Error("DPP not found");
			}

			// Remove correct answers for the attempt
			const questionsWithoutAnswers = dpp.questions.map((q) => ({
				questionText: q.questionText,
				questionImage: q.questionImage,
				options: q.options,
				marks: q.marks,
			}));

			return {
				dpp: {
					...dpp,
					questions: questionsWithoutAnswers,
				},
			};
		}),

	// Submit DPP attempt
	submitDPPAttempt: protectedProcedure
		.input(
			z.object({
				dppId: z.string(),
				answers: z.array(
					z.object({
						questionIndex: z.number(),
						selectedAnswer: z.number().min(0).max(3),
					}),
				),
			}),
		)
		.handler(async ({ input, context }) => {
			const userId = context.session?.user?.id;
			if (!userId) throw new Error("Unauthorized");

			const dpp = await DPP.findById(input.dppId).lean();
			if (!dpp) throw new Error("DPP not found");

			// Calculate score
			let score = 0;
			let totalMarks = 0;
			const answersWithResult = input.answers.map((answer) => {
				const question = dpp.questions[answer.questionIndex];
				if (!question) return { ...answer, isCorrect: false, marksObtained: 0 };

				totalMarks += question.marks;
				const isCorrect = question.correctAnswer === answer.selectedAnswer;
				const marksObtained = isCorrect ? question.marks : 0;
				score += marksObtained;

				return {
					...answer,
					isCorrect,
					marksObtained,
				};
			});

			const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;

			// Save attempt
			const attempt = new DPPAttempt({
				_id: crypto.randomUUID(),
				userId,
				dppId: input.dppId,
				courseId: dpp.courseId,
				subject: dpp.subject,
				target: dpp.target,
				attemptedAt: new Date(),
				submittedAt: new Date(),
				score,
				totalMarks,
				percentage,
				answers: answersWithResult,
				isCompleted: true,
			});

			await attempt.save();

			// Update study streak
			await updateStudyStreak(userId);

			// Return results with correct answers and explanations
			return {
				attempt: {
					score,
					totalMarks,
					percentage,
					answers: answersWithResult,
				},
				solutions: dpp.questions.map((q, i) => ({
					questionIndex: i,
					correctAnswer: q.correctAnswer,
					explanation: q.explanation,
				})),
			};
		}),

	// ============== PROGRESS TRACKING ==============

	// Mark video as watched/completed
	updateVideoProgress: protectedProcedure
		.input(
			z.object({
				videoId: z.string(),
				watchedDuration: z.number().min(0),
				isCompleted: z.boolean().default(false),
			}),
		)
		.handler(async ({ input, context }) => {
			const userId = context.session?.user?.id;
			if (!userId) throw new Error("Unauthorized");

			const video = await Video.findById(input.videoId).lean();
			if (!video) throw new Error("Video not found");

			const course = await Course.findById(video.courseId).lean();

			await VideoProgress.findOneAndUpdate(
				{ userId, videoId: input.videoId },
				{
					$set: {
						watchedDuration: input.watchedDuration,
						isCompleted: input.isCompleted,
						lastWatchedAt: new Date(),
						courseId: video.courseId,
						videoTitle: video.title,
						courseTitle: course?.title,
						...(input.isCompleted ? { completedAt: new Date() } : {}),
					},
					$setOnInsert: {
						_id: crypto.randomUUID(),
					},
				},
				{ upsert: true, new: true },
			);

			// Update course progress
			await updateCourseProgress(userId, video.courseId as string);

			// Update study streak
			await updateStudyStreak(userId);

			return { success: true };
		}),

	// Get user's enrolled/in-progress courses
	getMyCourses: protectedProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(50).default(20),
				offset: z.number().min(0).default(0),
			}),
		)
		.handler(async ({ input, context }) => {
			const userId = context.session?.user?.id;
			if (!userId) throw new Error("Unauthorized");

			const progress = await CourseProgress.find({ userId })
				.sort({ lastAccessedAt: -1 })
				.limit(input.limit)
				.skip(input.offset)
				.lean();

			// Get course details
			const courseIds = progress.map((p) => p.courseId);
			const courses = await Course.find({ _id: { $in: courseIds } }).lean();

			const coursesMap = courses.reduce(
				(acc, c) => {
					acc[c._id as string] = c;
					return acc;
				},
				{} as Record<string, (typeof courses)[0]>,
			);

			return {
				courses: progress.map((p) => ({
					...coursesMap[p.courseId as string],
					progress: {
						completionPercentage: p.completionPercentage,
						isCompleted: p.isCompleted,
						lastAccessedAt: p.lastAccessedAt,
					},
				})),
			};
		}),

	// Get continue watching (recently watched videos)
	getContinueWatching: protectedProcedure
		.input(z.object({ limit: z.number().min(1).max(10).default(5) }))
		.handler(async ({ input, context }) => {
			const userId = context.session?.user?.id;
			if (!userId) throw new Error("Unauthorized");

			const recentVideos = await VideoProgress.find({
				userId,
				isCompleted: false,
			})
				.sort({ lastWatchedAt: -1 })
				.limit(input.limit)
				.lean();

			const videoIds = recentVideos.map((v) => v.videoId);
			const videos = await Video.find({ _id: { $in: videoIds } }).lean();

			const videosMap = videos.reduce(
				(acc, v) => {
					acc[v._id as string] = v;
					return acc;
				},
				{} as Record<string, (typeof videos)[0]>,
			);

			return {
				videos: recentVideos.map((p) => {
					const v = videosMap[p.videoId as string];
					const hasBunnyVideo = v?.bunnyVideoId && v?.status === "ready";
					return {
						...v,
						watchedDuration: p.watchedDuration,
						lastWatchedAt: p.lastWatchedAt,
						// Bunny playback URLs (only if video is ready)
						playbackUrl: hasBunnyVideo ? getPlaybackUrl(v.bunnyVideoId!) : null,
						thumbnailUrl: hasBunnyVideo
							? getThumbnailUrl(v.bunnyVideoId!)
							: v?.thumbnailUrl || null,
						embedUrl: hasBunnyVideo ? getEmbedUrl(v.bunnyVideoId!) : null,
					};
				}),
			};
		}),

	// Get user stats for profile
	getUserStats: protectedProcedure.handler(async ({ context }) => {
		const userId = context.session?.user?.id;
		if (!userId) throw new Error("Unauthorized");

		const [
			enrolledCourses,
			completedCourses,
			completedVideos,
			dppAttempts,
			streak,
		] = await Promise.all([
			CourseProgress.countDocuments({ userId }),
			CourseProgress.countDocuments({ userId, isCompleted: true }),
			VideoProgress.countDocuments({ userId, isCompleted: true }),
			DPPAttempt.countDocuments({ userId, isCompleted: true }),
			StudyStreak.findOne({ userId }).lean(),
		]);

		// Calculate average DPP score
		const dppStats = await DPPAttempt.aggregate([
			{ $match: { userId, isCompleted: true } },
			{ $group: { _id: null, avgPercentage: { $avg: "$percentage" } } },
		]);

		return {
			enrolledCourses,
			completedCourses,
			completedVideos,
			dppAttempts,
			avgDPPScore: dppStats[0]?.avgPercentage || 0,
			currentStreak: streak?.currentStreak || 0,
			longestStreak: streak?.longestStreak || 0,
			totalStudyDays: streak?.totalStudyDays || 0,
		};
	}),
};

// Helper function to update course progress
async function updateCourseProgress(userId: string, courseId: string) {
	const [totalVideos, completedVideos, course] = await Promise.all([
		Video.countDocuments({ courseId, isPublished: true }),
		VideoProgress.countDocuments({ userId, courseId, isCompleted: true }),
		Course.findById(courseId).lean(),
	]);

	const completionPercentage =
		totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;
	const isCompleted = totalVideos > 0 && completedVideos >= totalVideos;

	await CourseProgress.findOneAndUpdate(
		{ userId, courseId },
		{
			$set: {
				completionPercentage,
				isCompleted,
				lastAccessedAt: new Date(),
				courseTitle: course?.title,
				target: course?.target,
				...(isCompleted ? { completedAt: new Date() } : {}),
			},
			$setOnInsert: {
				_id: crypto.randomUUID(),
				enrolledAt: new Date(),
			},
		},
		{ upsert: true },
	);
}

// Helper function to update study streak
async function updateStudyStreak(userId: string) {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const streak = await StudyStreak.findOne({ userId });

	if (!streak) {
		// First study day
		await StudyStreak.create({
			_id: crypto.randomUUID(),
			userId,
			currentStreak: 1,
			longestStreak: 1,
			lastStudyDate: today,
			studyDates: [today],
			totalStudyDays: 1,
		});
		return;
	}

	const lastStudy = streak.lastStudyDate
		? new Date(streak.lastStudyDate)
		: null;
	if (lastStudy) {
		lastStudy.setHours(0, 0, 0, 0);
	}

	// Already studied today
	if (lastStudy && lastStudy.getTime() === today.getTime()) {
		return;
	}

	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);

	let newCurrentStreak = 1;
	if (lastStudy && lastStudy.getTime() === yesterday.getTime()) {
		// Continuing streak
		newCurrentStreak = (streak.currentStreak || 0) + 1;
	}

	await StudyStreak.updateOne(
		{ userId },
		{
			$set: {
				currentStreak: newCurrentStreak,
				longestStreak: Math.max(streak.longestStreak || 0, newCurrentStreak),
				lastStudyDate: today,
			},
			$push: { studyDates: today },
			$inc: { totalStudyDays: 1 },
		},
	);
}
