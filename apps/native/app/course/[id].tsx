import { router, useLocalSearchParams } from "expo-router";
import { Image, Text, View } from "react-native";
import { Container } from "@/components/container";
import { LessonItem } from "@/components/lesson-item";
import { ProgressBar } from "@/components/progress-bar";
import { courses } from "@/data/courses";
import { useProgress } from "@/hooks/useProgress";

export default function CourseDetails() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { isLessonCompleted, getCourseProgress } = useProgress();
	const course = courses.find((c) => c.id === id);
	if (!course) return null;
	return (
		<Container className="p-6">
			<View className="mb-4">
				<Image
					source={{ uri: course.image }}
					className="mb-3 h-36 w-full rounded-2xl"
				/>
				<Text className="font-bold text-2xl text-foreground">
					{course.title}
				</Text>
				<Text className="text-muted-foreground text-xs">
					{course.durationMinutes} mins total
				</Text>
				{course.instructor && (
					<Text className="mt-1 text-muted-foreground text-xs">
						Instructor: {course.instructor}
					</Text>
				)}
				{course.description && (
					<Text className="mt-2 text-muted-foreground text-sm">
						{course.description}
					</Text>
				)}
				<View className="mt-3">
					<ProgressBar
						value={getCourseProgress(course.lessons.map((l) => l.id))}
					/>
				</View>
			</View>
			<View>
				{course.lessons.map((l) => (
					<LessonItem
						key={l.id}
						title={l.title}
						duration={l.durationMinutes}
						completed={isLessonCompleted(l.id)}
						onPress={() => {
							router.push({
								pathname: "lesson/[lessonId]" as any,
								params: { lessonId: l.id },
							} as any);
						}}
					/>
				))}
			</View>
		</Container>
	);
}
