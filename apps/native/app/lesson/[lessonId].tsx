import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { cn } from "heroui-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomNavigation } from "@/components/bottom-navigation";
import { VideoPlayer } from "@/components/video-player";
import { courses } from "@/data/courses";
import { useProgress } from "@/hooks/useProgress";

// Mock data for related lessons
const relatedLessons = [
	{ id: "1", title: "Linear Equation of one variable lecture - 1" },
	{ id: "2", title: "Linear Equation of one variable lecture - 2" },
	{ id: "3", title: "Linear Equation of one variable lecture - 3" },
	{ id: "4", title: "Linear Equation of one variable lecture - 4" },
	{ id: "5", title: "Linear Equation of one variable lecture - 5" },
	{ id: "6", title: "Linear Equation of one variable lecture - 6" },
	{ id: "7", title: "Linear Equation of one variable lecture - 7" },
	{ id: "8", title: "Linear Equation of one variable lecture - 8" },
	{ id: "9", title: "Linear Equation of one variable lecture - 9" },
];

type LessonItemProps = {
	title: string;
	isActive?: boolean;
	isPlaying?: boolean;
	onPress?: () => void;
};

function LessonItem({ title, isActive, isPlaying, onPress }: LessonItemProps) {
	return (
		<Pressable
			onPress={onPress}
			className={cn("flex-row items-center py-3", isActive && "bg-muted/10")}
		>
			{isPlaying ? (
				<View className="mr-3 h-6 w-6 items-center justify-center">
					<Ionicons name="play" size={16} color="var(--foreground)" />
				</View>
			) : (
				<View className="mr-3 h-6 w-6" />
			)}
			<Text
				className={cn(
					"flex-1 text-sm",
					isActive ? "font-semibold text-danger" : "text-foreground",
				)}
			>
				{title}
			</Text>
		</Pressable>
	);
}

type TabButtonProps = {
	label: string;
	onPress?: () => void;
};

function TabButton({ label, onPress }: TabButtonProps) {
	return (
		<Pressable
			onPress={onPress}
			className="flex-row items-center rounded-lg border border-border px-4 py-2"
		>
			<View className="mr-2 rounded bg-danger px-1.5 py-0.5">
				<Text className="font-bold text-white text-xs">PDF</Text>
			</View>
			<Text className="font-medium text-foreground text-sm">{label}</Text>
		</Pressable>
	);
}

export default function LessonView() {
	const insets = useSafeAreaInsets();
	const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
	const [isLive] = useState(false); // Could be passed as a param
	const [currentLessonIndex, setCurrentLessonIndex] = useState(4); // 0-indexed, lecture 5 is active

	// Find lesson from courses data
	const lesson = courses
		.flatMap((c) => c.lessons)
		.find((l) => l.id === lessonId);

	const { toggle, isLessonCompleted } = useProgress();

	// Use mock data if lesson not found
	const lessonTitle = lesson?.title || "Linear Equation of one variable";
	const lessonSubtitle = "Lecture - 5";
	const batchInfo = "JNVST TITAN 2.0 Batch 2026";
	// YouTube video ID - in production, this would come from the lesson data or API
	// Using a known working video for testing - replace with actual video IDs
	const videoId = lesson?.youtubeId || "dQw4w9WgXcQ";

	const handleNavigation = (route: string) => {
		if (route === "home") {
			router.push("home" as never);
		} else if (route === "batches") {
			router.push("my-batches" as never);
		} else if (route === "profile") {
			router.push("profile" as never);
		}
	};

	const handleLessonSelect = (index: number) => {
		setCurrentLessonIndex(index);
		// In real app, would navigate or update video
	};

	return (
		<View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ paddingBottom: 20 }}
				showsVerticalScrollIndicator={false}
			>
				<Animated.View entering={FadeIn}>
					{/* Video Player */}
					<VideoPlayer
						videoId={videoId}
						isLive={isLive}
						onBack={() => router.back()}
					/>

					{/* Lesson Info */}
					<View className="border-border border-b px-4 py-4">
						<Text className="font-bold text-foreground text-lg">
							{lessonTitle}
						</Text>
						<Text className="font-bold text-foreground text-lg">
							{lessonSubtitle}
							{isLive && <Text className="text-danger"> ( Live )</Text>}
						</Text>
						<Text className="mt-1 text-muted-foreground text-sm">
							{batchInfo}
						</Text>
					</View>

					{/* Notes & DPPs Buttons */}
					<View className="flex-row justify-center gap-6 border-border border-b py-4">
						<TabButton label="Notes" onPress={() => {}} />
						<TabButton label="DPPs" onPress={() => {}} />
					</View>

					{/* Up Next Section */}
					<View className="px-4 py-4">
						<Text className="mb-2 font-bold text-base text-foreground">
							Up next
						</Text>

						{relatedLessons.map((item, index) => (
							<LessonItem
								key={item.id}
								title={item.title}
								isActive={index === currentLessonIndex}
								isPlaying={index === currentLessonIndex}
								onPress={() => handleLessonSelect(index)}
							/>
						))}
					</View>

					{/* Mark Complete Button (for non-live videos) */}
					{!isLive && lesson && (
						<View className="px-4 py-4">
							<Pressable
								className={cn(
									"items-center rounded-xl px-6 py-3",
									isLessonCompleted(lesson.id) ? "bg-success" : "bg-primary",
								)}
								onPress={() => {
									toggle(lesson.id, true);
								}}
							>
								<Text className="font-semibold text-white">
									{isLessonCompleted(lesson.id)
										? "Completed"
										: "Mark as Completed"}
								</Text>
							</Pressable>
						</View>
					)}
				</Animated.View>
			</ScrollView>

			{/* Bottom Navigation */}
			<BottomNavigation currentRoute="batches" onNavigate={handleNavigation} />
		</View>
	);
}
