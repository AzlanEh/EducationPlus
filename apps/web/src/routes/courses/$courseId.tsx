import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { LessonItem } from "@/components/lesson-item";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useCourseById, useCoursesStore } from "@/store";

export const Route = createFileRoute("/courses/$courseId")({
	component: CourseDetail,
});

function CourseDetail() {
	const { courseId } = Route.useParams();
	const course = useCourseById(courseId);
	const { markLessonComplete, updateCourseProgress } = useCoursesStore();
	const navigate = useNavigate();

	if (!course) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center">
					<h1 className="mb-4 font-bold text-2xl">Course not found</h1>
					<Button onClick={() => navigate({ to: "/courses" })}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Courses
					</Button>
				</div>
			</div>
		);
	}

	const handleLessonToggle = (lessonId: string, completed: boolean) => {
		markLessonComplete(courseId, lessonId, completed);

		// Update overall course progress
		const completedLessons = course.lessons.filter((lesson) =>
			lesson.id === lessonId ? completed : lesson.completed,
		).length;
		const newProgress = (completedLessons / course.lessons.length) * 100;
		updateCourseProgress(courseId, newProgress);
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-6">
				<Button
					variant="ghost"
					onClick={() => navigate({ to: "/courses" })}
					className="mb-4"
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to Courses
				</Button>

				<div className="mb-6">
					<h1 className="mb-2 font-bold text-3xl">{course.title}</h1>
					<p className="mb-4 text-lg text-muted-foreground">
						{course.description}
					</p>
					<div className="flex items-center gap-4">
						<span className="text-muted-foreground text-sm">
							{course.duration}
						</span>
						<span className="text-muted-foreground text-sm">
							{Math.round(course.progress)}% complete
						</span>
					</div>
					<Progress value={course.progress} className="mt-2" />
				</div>
			</div>

			<div className="space-y-4">
				<h2 className="font-semibold text-xl">Lessons</h2>
				{course.lessons.map((lesson) => (
					<LessonItem
						key={lesson.id}
						lesson={lesson}
						onToggleComplete={handleLessonToggle}
					/>
				))}
			</div>
		</div>
	);
}
