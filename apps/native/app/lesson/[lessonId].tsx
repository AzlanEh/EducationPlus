import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { cn } from "heroui-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Skeleton, SkeletonText, useToast } from "@/components/ui";
import { VideoPlayer } from "@/components/video-player";
import { client, queryClient } from "@/utils/orpc";

type Video = {
	_id: string;
	title: string;
	description?: string;
	youtubeId: string;
	duration?: number;
	order: number;
	isCompleted?: boolean;
	courseId: string;
	moduleId?: string;
};

type LessonItemProps = {
	video: Video;
	isActive?: boolean;
	onPress?: () => void;
};

function LessonItem({ video, isActive, onPress }: LessonItemProps) {
	return (
		<Pressable
			onPress={onPress}
			className={cn(
				"flex-row items-center rounded-xl px-3 py-3",
				isActive && "bg-primary/10",
			)}
		>
			<View
				className={cn(
					"mr-3 h-8 w-8 items-center justify-center rounded-full",
					isActive
						? "bg-primary"
						: video.isCompleted
							? "bg-success"
							: "bg-muted/20",
				)}
			>
				{video.isCompleted && !isActive ? (
					<Ionicons name="checkmark" size={16} color="white" />
				) : (
					<Ionicons
						name={isActive ? "play" : "play-outline"}
						size={14}
						color={isActive ? "white" : "var(--muted-foreground)"}
					/>
				)}
			</View>
			<View className="flex-1">
				<Text
					className={cn(
						"text-sm",
						isActive ? "font-semibold text-primary" : "text-foreground",
					)}
					numberOfLines={2}
				>
					{video.title}
				</Text>
				{video.duration && (
					<Text className="mt-0.5 text-muted-foreground text-xs">
						{Math.floor(video.duration / 60)} min
					</Text>
				)}
			</View>
		</Pressable>
	);
}

type TabButtonProps = {
	label: string;
	onPress?: () => void;
	disabled?: boolean;
};

function TabButton({ label, onPress, disabled }: TabButtonProps) {
	return (
		<Pressable
			onPress={onPress}
			disabled={disabled}
			className={cn(
				"flex-row items-center rounded-lg border border-border px-4 py-2",
				disabled && "opacity-50",
			)}
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
	const { lessonId, courseId } = useLocalSearchParams<{
		lessonId: string;
		courseId?: string;
	}>();
	const { showToast } = useToast();

	const [currentVideoId, setCurrentVideoId] = useState(lessonId);
	const lastProgressUpdateRef = useRef<number>(0);

	// Fetch video details
	const { data: videoData, isLoading: videoLoading } = useQuery({
		queryKey: ["video", currentVideoId],
		queryFn: () => (client as any).v1.student.getVideo({ id: currentVideoId }),
		enabled: !!currentVideoId,
	});

	// Fetch course videos for the playlist
	const { data: courseVideosData, isLoading: courseVideosLoading } = useQuery({
		queryKey: ["course-videos", courseId || videoData?.video?.courseId],
		queryFn: () =>
			(client as any).v1.student.getCourseVideos({
				courseId: courseId || videoData?.video?.courseId,
			}),
		enabled: !!(courseId || videoData?.video?.courseId),
	});

	// Update progress mutation
	const updateProgressMutation = useMutation({
		mutationFn: (data: {
			videoId: string;
			watchedDuration: number;
			isCompleted: boolean;
		}) => (client as any).v1.student.updateVideoProgress(data),
		onSuccess: () => {
			// Invalidate related queries
			queryClient.invalidateQueries({
				queryKey: ["course-videos", courseId || videoData?.video?.courseId],
			});
			queryClient.invalidateQueries({ queryKey: ["continue-watching"] });
			queryClient.invalidateQueries({ queryKey: ["user-stats"] });
		},
	});

	const video = videoData?.video;
	const progress = videoData?.progress;
	const courseVideos = courseVideosData?.videos || [];
	const isLive = false; // Could be determined from video data

	// Find current video index
	const currentVideoIndex = courseVideos.findIndex(
		(v: Video) => v._id === currentVideoId,
	);

	// Update progress periodically (every 30 seconds while watching)
	const handleProgressUpdate = useCallback(
		(watchedDuration: number, isCompleted = false) => {
			const now = Date.now();
			// Only update every 30 seconds unless completing
			if (!isCompleted && now - lastProgressUpdateRef.current < 30000) {
				return;
			}
			lastProgressUpdateRef.current = now;

			if (currentVideoId) {
				updateProgressMutation.mutate({
					videoId: currentVideoId,
					watchedDuration: Math.floor(watchedDuration),
					isCompleted,
				});
			}
		},
		[currentVideoId, updateProgressMutation],
	);

	// Mark as completed
	const handleMarkComplete = useCallback(() => {
		if (currentVideoId && video) {
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
			updateProgressMutation.mutate(
				{
					videoId: currentVideoId,
					watchedDuration: video.duration || 0,
					isCompleted: true,
				},
				{
					onSuccess: () => {
						showToast({
							type: "success",
							title: "Video completed!",
							message: "Great job! Keep learning.",
						});
					},
				},
			);
		}
	}, [currentVideoId, video, updateProgressMutation, showToast]);

	// Switch to another video
	const handleVideoSelect = useCallback((videoId: string) => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		setCurrentVideoId(videoId);
	}, []);

	const handleNavigation = (route: string) => {
		if (route === "home") {
			router.push("home" as never);
		} else if (route === "batches") {
			router.push("my-batches" as never);
		} else if (route === "profile") {
			router.push("profile" as never);
		}
	};

	const handleNotesPress = () => {
		if (video?.courseId) {
			router.push({
				pathname: "/course/[id]",
				params: { id: video.courseId, tab: "notes" },
			} as never);
		}
	};

	const handleDPPsPress = () => {
		if (video?.courseId) {
			router.push({
				pathname: "/course/[id]",
				params: { id: video.courseId, tab: "dpps" },
			} as never);
		}
	};

	// Loading state
	if (videoLoading) {
		return (
			<View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
				<Skeleton className="h-56 w-full" />
				<View className="border-border border-b px-4 py-4">
					<SkeletonText className="w-3/4" />
					<Skeleton className="mt-2 h-4 w-1/2" />
				</View>
				<View className="flex-row justify-center gap-6 border-border border-b py-4">
					<Skeleton className="h-10 w-24 rounded-lg" />
					<Skeleton className="h-10 w-24 rounded-lg" />
				</View>
				<View className="px-4 py-4">
					<Skeleton className="mb-3 h-5 w-20" />
					{[1, 2, 3, 4, 5].map((i) => (
						<Skeleton key={i} className="mb-2 h-14 w-full rounded-xl" />
					))}
				</View>
			</View>
		);
	}

	// Not found state
	if (!video) {
		return (
			<View
				className="flex-1 items-center justify-center bg-background"
				style={{ paddingTop: insets.top }}
			>
				<Ionicons name="videocam-off-outline" size={64} color="var(--muted)" />
				<Text className="mt-4 font-medium text-foreground text-lg">
					Video not found
				</Text>
				<Pressable
					onPress={() => router.back()}
					className="mt-4 rounded-xl bg-primary px-6 py-3"
				>
					<Text className="font-medium text-white">Go Back</Text>
				</Pressable>
			</View>
		);
	}

	const isCurrentVideoCompleted =
		progress?.isCompleted ||
		courseVideos.find((v: Video) => v._id === currentVideoId)?.isCompleted;

	return (
		<View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ paddingBottom: 100 }}
				showsVerticalScrollIndicator={false}
			>
				<Animated.View entering={FadeIn}>
					{/* Video Player */}
					<VideoPlayer
						videoId={video.youtubeId}
						isLive={isLive}
						onBack={() => router.back()}
					/>

					{/* Lesson Info */}
					<Animated.View
						entering={FadeInDown.delay(100)}
						className="border-border border-b px-4 py-4"
					>
						<Text className="font-bold text-foreground text-lg">
							{video.title}
						</Text>
						{video.description && (
							<Text
								className="mt-1 text-muted-foreground text-sm"
								numberOfLines={2}
							>
								{video.description}
							</Text>
						)}
						{video.duration && (
							<Text className="mt-1 text-muted-foreground text-xs">
								{Math.floor(video.duration / 60)} min
							</Text>
						)}
					</Animated.View>

					{/* Notes & DPPs Buttons */}
					<Animated.View
						entering={FadeInDown.delay(150)}
						className="flex-row justify-center gap-6 border-border border-b py-4"
					>
						<TabButton label="Notes" onPress={handleNotesPress} />
						<TabButton label="DPPs" onPress={handleDPPsPress} />
					</Animated.View>

					{/* Mark Complete Button */}
					{!isLive && (
						<Animated.View
							entering={FadeInDown.delay(200)}
							className="px-4 py-4"
						>
							<Pressable
								className={cn(
									"items-center rounded-xl px-6 py-3",
									isCurrentVideoCompleted ? "bg-success" : "bg-primary",
								)}
								onPress={handleMarkComplete}
								disabled={
									isCurrentVideoCompleted || updateProgressMutation.isPending
								}
							>
								{updateProgressMutation.isPending ? (
									<Text className="font-semibold text-white">Updating...</Text>
								) : (
									<View className="flex-row items-center gap-2">
										{isCurrentVideoCompleted && (
											<Ionicons
												name="checkmark-circle"
												size={20}
												color="white"
											/>
										)}
										<Text className="font-semibold text-white">
											{isCurrentVideoCompleted
												? "Completed"
												: "Mark as Completed"}
										</Text>
									</View>
								)}
							</Pressable>
						</Animated.View>
					)}

					{/* Up Next Section */}
					{courseVideos.length > 0 && (
						<Animated.View
							entering={FadeInDown.delay(250)}
							className="px-4 py-4"
						>
							<Text className="mb-3 font-bold text-base text-foreground">
								Course Videos
							</Text>

							{courseVideosLoading ? (
								<View>
									{[1, 2, 3].map((i) => (
										<Skeleton key={i} className="mb-2 h-14 w-full rounded-xl" />
									))}
								</View>
							) : (
								<View className="gap-1">
									{courseVideos.map((item: Video, index: number) => (
										<LessonItem
											key={item._id}
											video={item}
											isActive={item._id === currentVideoId}
											onPress={() => handleVideoSelect(item._id)}
										/>
									))}
								</View>
							)}
						</Animated.View>
					)}
				</Animated.View>
			</ScrollView>

			{/* Bottom Navigation */}
			<View
				className="absolute right-0 bottom-0 left-0 bg-background"
				style={{ paddingBottom: insets.bottom }}
			>
				<BottomNavigation
					currentRoute="batches"
					onNavigate={handleNavigation}
				/>
			</View>
		</View>
	);
}
