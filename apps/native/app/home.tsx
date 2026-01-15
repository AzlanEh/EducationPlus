import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { cn } from "heroui-native";
import { useCallback, useState } from "react";
import {
	Image,
	Linking,
	Pressable,
	RefreshControl,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomNavigation } from "@/components/bottom-navigation";
import { CategoryCard } from "@/components/CategoryCard";
import { CourseCard } from "@/components/course-card";
import { FeatureCard } from "@/components/feature-card";
import { ReferralBanner } from "@/components/referral-banner";
import { ThemeToggle } from "@/components/theme-toggle";
import {
	CourseCardSkeleton,
	Header,
	Skeleton,
	SkeletonText,
} from "@/components/ui";
import { useAppTheme } from "@/contexts/app-theme-context";
import { useUser } from "@/hooks/useUser";
import { authClient } from "@/lib/auth-client";
import { client, queryClient } from "@/utils/orpc";

// Categories for filtering
const categories = [
	{
		id: "jee",
		title: "JEE",
		icon: { uri: "https://via.placeholder.com/64/4CAF50/FFFFFF?text=JEE" },
	},
	{
		id: "neet",
		title: "NEET",
		icon: { uri: "https://via.placeholder.com/64/2196F3/FFFFFF?text=NEET" },
	},
	{
		id: "cbse",
		title: "CBSE",
		icon: { uri: "https://via.placeholder.com/64/FF9800/FFFFFF?text=CBSE" },
	},
	{
		id: "foundation",
		title: "Foundation",
		icon: { uri: "https://via.placeholder.com/64/9C27B0/FFFFFF?text=FND" },
	},
];

// Study features
const studyFeatures = [
	{
		id: "1",
		title: "Study\nMaterial",
		icon: { uri: "https://via.placeholder.com/96/E8F5E9/4CAF50?text=SM" },
	},
	{
		id: "2",
		title: "Ask\nDoubts",
		icon: { uri: "https://via.placeholder.com/96/FFF3E0/FF9800?text=AD" },
	},
	{
		id: "3",
		title: "Test &\nQuizzes",
		icon: { uri: "https://via.placeholder.com/96/E3F2FD/2196F3?text=TQ" },
	},
	{
		id: "4",
		title: "Free Live\nClasses",
		icon: { uri: "https://via.placeholder.com/96/FCE4EC/E91E63?text=FLC" },
	},
	{
		id: "5",
		title: "PYQ",
		icon: { uri: "https://via.placeholder.com/96/F3E5F5/9C27B0?text=PYQ" },
	},
	{
		id: "6",
		title: "Free\nClasses",
		icon: { uri: "https://via.placeholder.com/96/E8EAF6/3F51B5?text=FC" },
	},
];

export default function Home() {
	const insets = useSafeAreaInsets();
	const [searchQuery, setSearchQuery] = useState("");
	const [refreshing, setRefreshing] = useState(false);
	const [notificationCount] = useState(3);
	const { user } = useUser();
	const { colors } = useAppTheme();

	// Get session for authenticated user
	const { data: session } = authClient.useSession();

	// Fetch featured courses
	const {
		data: featuredData,
		isLoading: featuredLoading,
		refetch: refetchFeatured,
	} = useQuery({
		queryKey: ["featured-courses"],
		queryFn: () => (client as any).v1.student.getFeaturedCourses({ limit: 5 }),
	});

	// Fetch continue watching (only for logged-in users)
	const {
		data: continueWatchingData,
		isLoading: continueLoading,
		refetch: refetchContinue,
	} = useQuery({
		queryKey: ["continue-watching"],
		queryFn: () => (client as any).v1.student.getContinueWatching({ limit: 5 }),
		enabled: !!session?.user,
	});

	// Fetch my courses (only for logged-in users)
	const {
		data: myCoursesData,
		isLoading: myCoursesLoading,
		refetch: refetchMyCourses,
	} = useQuery({
		queryKey: ["my-courses"],
		queryFn: () => (client as any).v1.student.getMyCourses({ limit: 5 }),
		enabled: !!session?.user,
	});

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		await Promise.all([
			refetchFeatured(),
			refetchContinue(),
			refetchMyCourses(),
		]);
		setRefreshing(false);
	}, [refetchFeatured, refetchContinue, refetchMyCourses]);

	const handleNavigation = (route: string) => {
		if (route === "profile") {
			router.push("profile" as never);
		} else if (route === "batches") {
			router.push("my-batches" as never);
		}
	};

	const handleContactUs = () => {
		Linking.openURL("https://wa.me/1234567890");
	};

	const handleNotificationPress = () => {
		router.push("notifications" as never);
	};

	const handleProfilePress = () => {
		router.push("profile" as never);
	};

	const handleCoursePress = (courseId: string) => {
		router.push({
			pathname: "course/[id]" as never,
			params: { id: courseId },
		});
	};

	const handleVideoPress = (videoId: string) => {
		router.push({
			pathname: "lesson/[lessonId]" as never,
			params: { lessonId: videoId },
		});
	};

	const displayName = session?.user?.name || user.name || "Student";

	return (
		<View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ paddingBottom: 20 }}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						tintColor={colors.primary}
						colors={[colors.primary]}
					/>
				}
			>
				<View className="px-4">
					{/* Header with User Greeting */}
					<View>
						<Header
							userName={displayName}
							userImage={session?.user?.image || undefined}
							notificationCount={notificationCount}
							onNotificationPress={handleNotificationPress}
							onProfilePress={handleProfilePress}
							rightContent={<ThemeToggle />}
						/>
					</View>

					{/* Hero Banner */}
					<View>
						<Pressable
							className="mb-4 overflow-hidden rounded-2xl"
							accessibilityRole="button"
							accessibilityLabel="Featured course banner"
						>
							<Image
								source={require("../assets/images/hero-banner.png")}
								style={{ width: "100%", height: 180 }}
								resizeMode="cover"
								className="rounded-2xl"
								accessibilityIgnoresInvertColors
							/>
						</Pressable>
					</View>

					{/* Search Bar */}
					<View>
						<Pressable
							onPress={() => router.push("courses" as never)}
							className="mb-6 flex-row items-center rounded-full border border-border bg-card px-4 py-3 shadow-sm"
						>
							<Ionicons
								name="search-outline"
								size={20}
								color="var(--muted-foreground)"
							/>
							<Text className="ml-3 flex-1 text-muted-foreground">
								Search courses...
							</Text>
						</Pressable>
					</View>

					{/* Categories Section */}
					<View className="mb-6">
						<View className="mb-3 flex-row items-center justify-between">
							<Text className="font-semibold text-base text-foreground">
								Categories
							</Text>
							<Pressable
								onPress={() => router.push("categories" as never)}
								hitSlop={8}
								accessibilityRole="button"
							>
								<Text className="font-medium text-primary text-sm">
									View All
								</Text>
							</Pressable>
						</View>
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={{ paddingRight: 16 }}
						>
							{categories.map((category, index) => (
								<View key={category.id}>
									<CategoryCard
										title={category.title}
										icon={category.icon}
										onPress={() =>
											router.push({
												pathname: "courses" as never,
												params: { target: category.id },
											})
										}
									/>
								</View>
							))}
						</ScrollView>
					</View>

					{/* Continue Watching Section (for logged-in users) */}
					{session?.user && (
						<View className="mb-6">
							<View className="mb-3 flex-row items-center justify-between">
								<View className="flex-row items-center">
									<Text className="font-semibold text-base text-foreground">
										Continue Watching
									</Text>
									<Ionicons
										name="play-circle"
										size={16}
										color="var(--primary)"
										style={{ marginLeft: 8 }}
									/>
								</View>
							</View>
							{continueLoading ? (
								<View className="gap-3">
									<CourseCardSkeleton />
								</View>
							) : continueWatchingData?.videos &&
								continueWatchingData.videos.length > 0 ? (
								<ScrollView
									horizontal
									showsHorizontalScrollIndicator={false}
									contentContainerStyle={{ gap: 12 }}
								>
									{continueWatchingData.videos.map((video: any) => (
										<Pressable
											key={video._id}
											onPress={() => handleVideoPress(video._id)}
											className="w-64 rounded-xl border border-border bg-card p-3"
										>
											<View className="mb-2 h-32 overflow-hidden rounded-lg bg-muted">
												<Image
													source={{
														uri: `https://img.youtube.com/vi/${video.youtubeVideoId}/mqdefault.jpg`,
													}}
													className="h-full w-full"
													resizeMode="cover"
												/>
												<View className="absolute inset-0 items-center justify-center bg-black/30">
													<Ionicons
														name="play-circle"
														size={48}
														color="white"
													/>
												</View>
											</View>
											<Text
												className="font-medium text-foreground text-sm"
												numberOfLines={2}
											>
												{video.title}
											</Text>
											<Text className="mt-1 text-muted-foreground text-xs">
												{Math.floor((video.watchedDuration || 0) / 60)} min
												watched
											</Text>
										</Pressable>
									))}
								</ScrollView>
							) : (
								<View className="items-center rounded-xl border border-border border-dashed py-8">
									<Ionicons
										name="play-circle-outline"
										size={32}
										color="var(--muted)"
									/>
									<Text className="mt-2 text-muted-foreground text-sm">
										No videos in progress
									</Text>
									<Pressable
										onPress={() => router.push("courses" as never)}
										className="mt-2"
									>
										<Text className="font-medium text-primary text-sm">
											Browse Courses
										</Text>
									</Pressable>
								</View>
							)}
						</View>
					)}

					{/* Featured Courses Section */}
					<View className="mb-6">
						<View className="mb-3 flex-row items-center justify-between">
							<View className="flex-row items-center">
								<Text className="font-semibold text-base text-foreground">
									Featured Courses
								</Text>
								<View className="ml-2 flex-row items-center rounded-full bg-danger/10 px-2 py-0.5">
									<Ionicons name="flame" size={12} color="var(--destructive)" />
									<Text className="ml-1 font-medium text-danger text-xs">
										Hot
									</Text>
								</View>
							</View>
							<Pressable
								onPress={() => router.push("courses" as never)}
								hitSlop={8}
								accessibilityRole="button"
							>
								<Text className="font-medium text-primary text-sm">
									View All
								</Text>
							</Pressable>
						</View>
						{featuredLoading ? (
							<View className="gap-3">
								<CourseCardSkeleton />
								<CourseCardSkeleton />
							</View>
						) : featuredData?.courses && featuredData.courses.length > 0 ? (
							featuredData.courses.map((course: any, index: number) => (
								<View key={course._id}>
									<CourseCard
										course={{
											id: course._id,
											title: course.title,
											image:
												course.thumbnail ||
												"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
											durationMinutes: 0,
											description: course.description,
											instructor: course.instructor,
											lessons: [],
										}}
										progress={0}
									/>
								</View>
							))
						) : (
							<View className="items-center rounded-xl border border-border border-dashed py-8">
								<Ionicons name="book-outline" size={32} color="var(--muted)" />
								<Text className="mt-2 text-muted-foreground text-sm">
									No courses available yet
								</Text>
							</View>
						)}
					</View>

					{/* My Courses Section (for logged-in users) */}
					{session?.user &&
						myCoursesData?.courses &&
						myCoursesData.courses.length > 0 && (
							<View className="mb-6">
								<View className="mb-3 flex-row items-center justify-between">
									<Text className="font-semibold text-base text-foreground">
										My Courses
									</Text>
									<Pressable
										onPress={() => router.push("dashboard" as never)}
										hitSlop={8}
									>
										<Text className="font-medium text-primary text-sm">
											View All
										</Text>
									</Pressable>
								</View>
								{myCoursesLoading ? (
									<View className="gap-3">
										<CourseCardSkeleton />
									</View>
								) : (
									myCoursesData.courses.map((course: any, index: number) => (
										<View key={course._id}>
											<CourseCard
												course={{
													id: course._id,
													title: course.title,
													image:
														course.thumbnail ||
														"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
													durationMinutes: 0,
													description: course.description,
													instructor: course.instructor,
													lessons: [],
												}}
												progress={course.progress?.completionPercentage || 0}
											/>
										</View>
									))
								)}
							</View>
						)}

					{/* Study With Education Plus+ Section */}
					<View className="mb-6">
						<Text className="mb-4 font-semibold text-base text-foreground">
							Study With Education Plus+
						</Text>
						<View className="flex-row flex-wrap justify-between">
							{studyFeatures.slice(0, 3).map((feature, index) => (
								<View key={feature.id}>
									<FeatureCard
										title={feature.title}
										icon={feature.icon}
										className="mb-4"
									/>
								</View>
							))}
						</View>
						<View className="flex-row flex-wrap justify-between">
							{studyFeatures.slice(3, 6).map((feature, index) => (
								<View key={feature.id}>
									<FeatureCard
										title={feature.title}
										icon={feature.icon}
										className="mb-4"
									/>
								</View>
							))}
						</View>
					</View>

					{/* Referral Banner */}
					<View>
						<ReferralBanner onSharePress={() => {}} />
					</View>

					{/* Footer Section */}
					<View className="mb-6 items-center">
						<Text className="font-bold text-2xl text-accent-orange">
							Give Wings to Your Dream!
						</Text>
						<View className="mt-1 flex-row items-center">
							<Text className="text-foreground text-sm">With </Text>
							<Ionicons name="heart" size={14} color="var(--destructive)" />
							<Text className="font-semibold text-accent text-sm">
								{" "}
								Education Plus+
							</Text>
						</View>
					</View>

					{/* Contact Button */}
					<View>
						<Pressable
							onPress={handleContactUs}
							accessibilityRole="button"
							accessibilityLabel="Contact us on WhatsApp"
							className={cn(
								"mb-4 flex-row items-center justify-center self-start",
								"rounded-full border border-success px-5 py-3 active:bg-success/10",
							)}
						>
							<Ionicons name="logo-whatsapp" size={18} color="var(--primary)" />
							<Text className="ml-2 font-semibold text-success">
								Contact Us
							</Text>
						</Pressable>
					</View>
				</View>
			</ScrollView>

			{/* Bottom Navigation */}
			<BottomNavigation currentRoute="home" onNavigate={handleNavigation} />
		</View>
	);
}
