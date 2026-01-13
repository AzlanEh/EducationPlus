import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
	Image,
	Pressable,
	RefreshControl,
	ScrollView,
	Text,
	View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomNavigation } from "@/components/bottom-navigation";
import { LessonItem } from "@/components/lesson-item";
import { ProgressBar } from "@/components/progress-bar";
import { CourseCardSkeleton, Skeleton, SkeletonText } from "@/components/ui";
import { client } from "@/utils/orpc";

type TabType = "lessons" | "notes" | "dpps";

export default function CourseDetails() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const insets = useSafeAreaInsets();
	const [activeTab, setActiveTab] = useState<TabType>("lessons");
	const [refreshing, setRefreshing] = useState(false);

	// Fetch course details
	const {
		data: courseData,
		isLoading: courseLoading,
		refetch: refetchCourse,
	} = useQuery({
		queryKey: ["course", id],
		queryFn: () => (client as any).v1.student.getCourseDetails({ id }),
		enabled: !!id,
	});

	// Fetch videos for this course
	const {
		data: videosData,
		isLoading: videosLoading,
		refetch: refetchVideos,
	} = useQuery({
		queryKey: ["course-videos", id],
		queryFn: () => (client as any).v1.student.getCourseVideos({ courseId: id }),
		enabled: !!id,
	});

	// Fetch notes for this course
	const {
		data: notesData,
		isLoading: notesLoading,
		refetch: refetchNotes,
	} = useQuery({
		queryKey: ["course-notes", id],
		queryFn: () => (client as any).v1.student.getCourseNotes({ courseId: id }),
		enabled: !!id && activeTab === "notes",
	});

	// Fetch DPPs for this course
	const {
		data: dppsData,
		isLoading: dppsLoading,
		refetch: refetchDPPs,
	} = useQuery({
		queryKey: ["course-dpps", id],
		queryFn: () => (client as any).v1.student.getCourseDPPs({ courseId: id }),
		enabled: !!id && activeTab === "dpps",
	});

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		await Promise.all([refetchCourse(), refetchVideos()]);
		if (activeTab === "notes") await refetchNotes();
		if (activeTab === "dpps") await refetchDPPs();
		setRefreshing(false);
	}, [activeTab, refetchCourse, refetchVideos, refetchNotes, refetchDPPs]);

	const handleNavigation = (route: string) => {
		if (route === "home") {
			router.push("home" as never);
		} else if (route === "batches") {
			router.push("my-batches" as never);
		} else if (route === "profile") {
			router.push("profile" as never);
		}
	};

	const handleVideoPress = (videoId: string) => {
		router.push({
			pathname: "lesson/[lessonId]" as never,
			params: { lessonId: videoId, courseId: id },
		});
	};

	const handleNotePress = (noteId: string) => {
		router.push({
			pathname: "note/[noteId]" as never,
			params: { noteId, courseId: id },
		});
	};

	const handleDPPPress = (dppId: string) => {
		router.push({
			pathname: "dpp/[dppId]" as never,
			params: { dppId, courseId: id },
		});
	};

	// Calculate progress
	const completedVideos =
		videosData?.videos?.filter((v: any) => v.isCompleted).length || 0;
	const totalVideos = videosData?.videos?.length || 0;
	const progress = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;

	if (courseLoading) {
		return (
			<View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
				<View className="px-4 py-4">
					<Skeleton className="mb-4 h-48 w-full rounded-2xl" />
					<SkeletonText lines={2} className="mb-4" />
					<SkeletonText lines={3} />
				</View>
			</View>
		);
	}

	if (!courseData) {
		return (
			<View
				className="flex-1 items-center justify-center bg-background"
				style={{ paddingTop: insets.top }}
			>
				<Ionicons name="alert-circle-outline" size={64} color="var(--muted)" />
				<Text className="mt-4 font-medium text-foreground text-lg">
					Course not found
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

	const course = courseData;

	return (
		<View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
			{/* Header */}
			<View
				className="absolute top-0 right-0 left-0 z-10 flex-row items-center justify-between px-4 py-2"
				style={{ paddingTop: insets.top + 8 }}
			>
				<Pressable
					onPress={() => router.back()}
					className="h-10 w-10 items-center justify-center rounded-full bg-black/30"
				>
					<Ionicons name="arrow-back" size={20} color="white" />
				</Pressable>
				<Pressable className="h-10 w-10 items-center justify-center rounded-full bg-black/30">
					<Ionicons name="bookmark-outline" size={20} color="white" />
				</Pressable>
			</View>

			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						tintColor="var(--primary)"
					/>
				}
			>
				{/* Course Banner */}
				<Animated.View entering={FadeIn.duration(400)}>
					<Image
						source={{
							uri:
								course.thumbnail ||
								"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
						}}
						className="h-56 w-full"
						resizeMode="cover"
					/>
				</Animated.View>

				{/* Course Info */}
				<View className="-mt-6 rounded-t-3xl bg-background px-4 pt-6 pb-4">
					<Animated.View entering={FadeInDown.delay(100).duration(400)}>
						<View className="mb-2 flex-row items-center">
							<View className="mr-2 rounded-full bg-primary/10 px-3 py-1">
								<Text className="font-medium text-primary text-xs">
									{course.target || "General"}
								</Text>
							</View>
							<View className="rounded-full bg-muted/20 px-3 py-1">
								<Text className="font-medium text-muted-foreground text-xs capitalize">
									{course.level || "All Levels"}
								</Text>
							</View>
						</View>

						<Text className="mb-1 font-bold text-2xl text-foreground">
							{course.title}
						</Text>

						<Text className="mb-3 text-muted-foreground text-sm">
							by {course.instructor || "Unknown Instructor"}
						</Text>

						{course.description && (
							<Text className="mb-4 text-foreground text-sm leading-relaxed">
								{course.description}
							</Text>
						)}

						{/* Stats */}
						<View className="mb-4 flex-row items-center gap-4">
							<View className="flex-row items-center">
								<Ionicons
									name="videocam-outline"
									size={16}
									color="var(--muted-foreground)"
								/>
								<Text className="ml-1 text-muted-foreground text-sm">
									{course.stats?.videoCount || 0} videos
								</Text>
							</View>
							<View className="flex-row items-center">
								<Ionicons
									name="document-text-outline"
									size={16}
									color="var(--muted-foreground)"
								/>
								<Text className="ml-1 text-muted-foreground text-sm">
									{course.stats?.noteCount || 0} notes
								</Text>
							</View>
							<View className="flex-row items-center">
								<Ionicons
									name="help-circle-outline"
									size={16}
									color="var(--muted-foreground)"
								/>
								<Text className="ml-1 text-muted-foreground text-sm">
									{course.stats?.dppCount || 0} DPPs
								</Text>
							</View>
						</View>

						{/* Progress */}
						{totalVideos > 0 && (
							<View className="mb-4">
								<View className="mb-1 flex-row items-center justify-between">
									<Text className="text-muted-foreground text-sm">
										Progress
									</Text>
									<Text className="font-medium text-foreground text-sm">
										{completedVideos}/{totalVideos} completed
									</Text>
								</View>
								<ProgressBar value={progress} />
							</View>
						)}
					</Animated.View>

					{/* Tabs */}
					<Animated.View
						entering={FadeInDown.delay(200).duration(400)}
						className="mb-4 flex-row border-border border-b"
					>
						{(["lessons", "notes", "dpps"] as TabType[]).map((tab) => (
							<Pressable
								key={tab}
								onPress={() => setActiveTab(tab)}
								className={`flex-1 items-center py-3 ${
									activeTab === tab ? "border-primary border-b-2" : ""
								}`}
							>
								<Text
									className={`font-medium text-sm capitalize ${
										activeTab === tab ? "text-primary" : "text-muted-foreground"
									}`}
								>
									{tab === "dpps" ? "DPPs" : tab}
								</Text>
							</Pressable>
						))}
					</Animated.View>

					{/* Tab Content */}
					<Animated.View entering={FadeInDown.delay(300).duration(400)}>
						{/* Lessons Tab */}
						{activeTab === "lessons" && (
							<View>
								{videosLoading ? (
									<View className="gap-3">
										{[1, 2, 3].map((i) => (
											<Skeleton key={i} className="h-16 w-full rounded-xl" />
										))}
									</View>
								) : videosData?.videos && videosData.videos.length > 0 ? (
									videosData.videos.map((video: any, index: number) => (
										<LessonItem
											key={video._id}
											title={video.title}
											duration={
												video.duration ? Math.floor(video.duration / 60) : 0
											}
											completed={video.isCompleted}
											onPress={() => handleVideoPress(video._id)}
										/>
									))
								) : (
									<View className="items-center py-8">
										<Ionicons
											name="videocam-outline"
											size={48}
											color="var(--muted)"
										/>
										<Text className="mt-2 text-muted-foreground">
											No videos available
										</Text>
									</View>
								)}
							</View>
						)}

						{/* Notes Tab */}
						{activeTab === "notes" && (
							<View>
								{notesLoading ? (
									<View className="gap-3">
										{[1, 2, 3].map((i) => (
											<Skeleton key={i} className="h-16 w-full rounded-xl" />
										))}
									</View>
								) : notesData?.notes && notesData.notes.length > 0 ? (
									notesData.notes.map((note: any) => (
										<Pressable
											key={note._id}
											onPress={() => handleNotePress(note._id)}
											className="mb-3 flex-row items-center rounded-xl border border-border bg-card p-4"
										>
											<View className="mr-3 h-10 w-10 items-center justify-center rounded-lg bg-danger/10">
												<Text className="font-bold text-danger text-xs">
													PDF
												</Text>
											</View>
											<View className="flex-1">
												<Text
													className="font-medium text-foreground"
													numberOfLines={1}
												>
													{note.title}
												</Text>
												{note.content && (
													<Text
														className="text-muted-foreground text-xs"
														numberOfLines={1}
													>
														{note.content.substring(0, 50)}...
													</Text>
												)}
											</View>
											<Ionicons
												name="chevron-forward"
												size={20}
												color="var(--muted)"
											/>
										</Pressable>
									))
								) : (
									<View className="items-center py-8">
										<Ionicons
											name="document-text-outline"
											size={48}
											color="var(--muted)"
										/>
										<Text className="mt-2 text-muted-foreground">
											No notes available
										</Text>
									</View>
								)}
							</View>
						)}

						{/* DPPs Tab */}
						{activeTab === "dpps" && (
							<View>
								{dppsLoading ? (
									<View className="gap-3">
										{[1, 2, 3].map((i) => (
											<Skeleton key={i} className="h-20 w-full rounded-xl" />
										))}
									</View>
								) : dppsData?.dpps && dppsData.dpps.length > 0 ? (
									dppsData.dpps.map((dpp: any) => (
										<Pressable
											key={dpp._id}
											onPress={() => handleDPPPress(dpp._id)}
											className="mb-3 rounded-xl border border-border bg-card p-4"
										>
											<View className="flex-row items-start justify-between">
												<View className="flex-1">
													<Text className="font-medium text-foreground">
														{dpp.title}
													</Text>
													<Text className="mt-1 text-muted-foreground text-xs">
														{dpp.questions?.length || 0} questions
													</Text>
													{dpp.attempt && (
														<View className="mt-2 flex-row items-center">
															<View className="rounded-full bg-success/10 px-2 py-0.5">
																<Text className="font-medium text-success text-xs">
																	Score: {dpp.attempt.percentage.toFixed(0)}%
																</Text>
															</View>
														</View>
													)}
												</View>
												<View className="flex-row items-center">
													{dpp.attempt ? (
														<View className="h-8 w-8 items-center justify-center rounded-full bg-success/10">
															<Ionicons
																name="checkmark"
																size={16}
																color="var(--success)"
															/>
														</View>
													) : (
														<View className="h-8 w-8 items-center justify-center rounded-full bg-primary/10">
															<Ionicons
																name="play"
																size={16}
																color="var(--primary)"
															/>
														</View>
													)}
												</View>
											</View>
										</Pressable>
									))
								) : (
									<View className="items-center py-8">
										<Ionicons
											name="help-circle-outline"
											size={48}
											color="var(--muted)"
										/>
										<Text className="mt-2 text-muted-foreground">
											No DPPs available
										</Text>
									</View>
								)}
							</View>
						)}
					</Animated.View>
				</View>
			</ScrollView>

			{/* Bottom Navigation */}
			<BottomNavigation currentRoute="courses" onNavigate={handleNavigation} />
		</View>
	);
}
