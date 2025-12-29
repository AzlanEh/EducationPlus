import { router } from "expo-router";
import { Card } from "heroui-native";
import { Image, Pressable, Text, View } from "react-native";
import { ProgressBar } from "@/components/progress-bar";
import type { Course } from "@/data/courses";

export function CourseCard({
	course,
	progress,
}: {
	course: Course;
	progress: number;
}) {
	return (
		<Pressable
			onPress={() => {
				router.push({
					pathname: "course/[id]" as any,
					params: { id: course.id },
				});
			}}
		>
			<Card
				variant="secondary"
				className="mb-4 flex-row overflow-hidden rounded-2xl p-0 shadow-sm"
			>
				<Image source={{ uri: course.image }} className="h-24 w-24" />
				<View className="flex-1 p-4">
					<Text className="mb-1 font-semibold text-foreground text-lg">
						{course.title}
					</Text>
					<Text className="mb-3 text-muted text-xs">
						{course.durationMinutes} mins
					</Text>
					<ProgressBar value={progress} />
				</View>
			</Card>
		</Pressable>
	);
}
