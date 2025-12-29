import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CourseCard } from "@/components/course-card";
import { useCourses, useCoursesLoading, useCoursesStore } from "@/store";

export const Route = createFileRoute("/courses")({
	component: Courses,
});

function Courses() {
	const courses = useCourses();
	const isLoading = useCoursesLoading();
	const { selectCourse } = useCoursesStore();
	const navigate = useNavigate();

	const handleCourseSelect = (course: any) => {
		selectCourse(course);
		navigate({ to: `/courses/${course.id}` });
	};

	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<h1 className="mb-8 font-bold text-3xl">My Courses</h1>
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{[...Array(6)].map((_, i) => (
						<div key={i} className="animate-pulse">
							<div className="mb-4 h-48 rounded-lg bg-muted" />
							<div className="mb-2 h-4 rounded bg-muted" />
							<div className="h-4 w-3/4 rounded bg-muted" />
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="mb-8 font-bold text-3xl">My Courses</h1>
			{courses.length === 0 ? (
				<div className="py-12 text-center">
					<p className="text-lg text-muted-foreground">
						No courses available yet.
					</p>
				</div>
			) : (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{courses.map((course) => (
						<CourseCard
							key={course.id}
							course={course}
							onSelect={handleCourseSelect}
						/>
					))}
				</div>
			)}
		</div>
	);
}
