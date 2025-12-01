import { router, useLocalSearchParams } from "expo-router";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import YoutubeIframe from "react-native-youtube-iframe";
import { Container } from "@/components/container";
import { courses } from "@/data/courses";
import { useProgress } from "@/hooks/useProgress";

export default function LessonView() {
	const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
	const lesson = courses
		.flatMap((c) => c.lessons)
		.find((l) => l.id === lessonId);
	const { toggle, isLessonCompleted } = useProgress();
	if (!lesson) return null;
	const completed = isLessonCompleted(lesson.id);
	return (
		<Container className="p-6">
			<Animated.View entering={FadeIn}>
				<Text className="mb-2 font-semibold text-foreground text-xl">
					{lesson.title}
				</Text>
				<Text className="mb-6 text-muted text-sm">
					{lesson.durationMinutes} mins
				</Text>
				<View className="mb-6 h-40 items-center justify-center rounded-xl bg-secondary">
					<YoutubeIframe height={200} play={false} videoId={lesson.youtubeId} />
				</View>
				<Pressable
					className={
						completed
							? "rounded-xl bg-success px-6 py-3"
							: "rounded-xl bg-primary px-6 py-3"
					}
					onPress={() => {
						toggle(lesson.id, true);
						router.back();
					}}
				>
					<Text
						className={
							completed ? "text-success-foreground" : "text-primary-foreground"
						}
					>
						{completed ? "Completed" : "Mark as Completed"}
					</Text>
				</Pressable>
			</Animated.View>
		</Container>
	);
}
