import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Course, CoursesState, Lesson } from "./types";

interface CoursesStore extends CoursesState {
	setCourses: (courses: Course[]) => void;
	setLoading: (loading: boolean) => void;
	selectCourse: (course: Course | null) => void;
	updateCourseProgress: (courseId: string, progress: number) => void;
	markLessonComplete: (
		courseId: string,
		lessonId: string,
		completed: boolean,
	) => void;
	getCourseById: (courseId: string) => Course | undefined;
	getCompletedLessonsCount: (courseId: string) => number;
}

export const useCoursesStore = create<CoursesStore>()(
	persist(
		(set, get) => ({
			courses: [],
			selectedCourse: null,
			isLoading: false,

			setCourses: (courses) => set({ courses }),

			setLoading: (isLoading) => set({ isLoading }),

			selectCourse: (selectedCourse) => set({ selectedCourse }),

			updateCourseProgress: (courseId, progress) =>
				set((state) => ({
					courses: state.courses.map((course) =>
						course.id === courseId ? { ...course, progress } : course,
					),
				})),

			markLessonComplete: (courseId, lessonId, completed) =>
				set((state) => ({
					courses: state.courses.map((course) =>
						course.id === courseId
							? {
									...course,
									lessons: course.lessons.map((lesson) =>
										lesson.id === lessonId ? { ...lesson, completed } : lesson,
									),
								}
							: course,
					),
				})),

			getCourseById: (courseId) => {
				const { courses } = get();
				return courses.find((course) => course.id === courseId);
			},

			getCompletedLessonsCount: (courseId) => {
				const course = get().getCourseById(courseId);
				return course
					? course.lessons.filter((lesson) => lesson.completed).length
					: 0;
			},
		}),
		{
			name: "courses-storage",
			partialize: (state) => ({
				courses: state.courses,
				selectedCourse: state.selectedCourse,
			}),
		},
	),
);
