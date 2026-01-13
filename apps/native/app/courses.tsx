import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
	FlatList,
	Pressable,
	RefreshControl,
	Text,
	TextInput,
	View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomNavigation } from "@/components/bottom-navigation";
import { CategoryChip } from "@/components/category-chip";
import { CourseCard } from "@/components/course-card";
import { CourseCardSkeleton, EmptyState, ErrorState } from "@/components/ui";
import { client } from "@/utils/orpc";

const TARGETS = [
	{ id: "all", label: "All" },
	{ id: "jee", label: "JEE" },
	{ id: "neet", label: "NEET" },
	{ id: "cbse", label: "CBSE" },
	{ id: "foundation", label: "Foundation" },
];

const LEVELS = [
	{ id: "all", label: "All Levels" },
	{ id: "beginner", label: "Beginner" },
	{ id: "intermediate", label: "Intermediate" },
	{ id: "advanced", label: "Advanced" },
];

export default function Courses() {
	const insets = useSafeAreaInsets();
	const params = useLocalSearchParams<{ target?: string; search?: string }>();

	const [searchQuery, setSearchQuery] = useState(params.search || "");
	const [selectedTarget, setSelectedTarget] = useState(params.target || "all");
	const [selectedLevel, setSelectedLevel] = useState("all");
	const [refreshing, setRefreshing] = useState(false);

	// Fetch courses with filters
	const {
		data: coursesData,
		isLoading,
		isError,
		refetch,
		error,
	} = useQuery({
		queryKey: ["courses", selectedTarget, selectedLevel, searchQuery],
		queryFn: () =>
			(client as any).v1.student.getPublishedCourses({
				limit: 50,
				offset: 0,
				target: selectedTarget !== "all" ? selectedTarget : undefined,
				level: selectedLevel !== "all" ? selectedLevel : undefined,
				search: searchQuery || undefined,
			}),
	});

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		await refetch();
		setRefreshing(false);
	}, [refetch]);

	const handleNavigation = (route: string) => {
		if (route === "home") {
			router.push("home" as never);
		} else if (route === "profile") {
			router.push("profile" as never);
		} else if (route === "batches") {
			router.push("my-batches" as never);
		}
	};

	const handleCoursePress = (courseId: string) => {
		router.push({
			pathname: "course/[id]" as never,
			params: { id: courseId },
		});
	};

	const renderCourse = ({ item, index }: { item: any; index: number }) => (
		<Animated.View
			entering={FadeInUp.delay(index * 50).duration(300)}
			className="px-4"
		>
			<Pressable onPress={() => handleCoursePress(item._id)}>
				<CourseCard
					course={{
						id: item._id,
						title: item.title,
						image:
							item.thumbnail ||
							"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
						durationMinutes: 0,
						description: item.description,
						instructor: item.instructor,
						lessons: [],
					}}
					progress={0}
				/>
			</Pressable>
		</Animated.View>
	);

	const renderHeader = () => (
		<View className="px-4 pb-4">
			{/* Search Bar */}
			<Animated.View entering={FadeInDown.delay(100).duration(400)}>
				<View className="mb-4 flex-row items-center rounded-xl border border-border bg-card px-4 py-3">
					<Ionicons
						name="search-outline"
						size={20}
						color="var(--muted-foreground)"
					/>
					<TextInput
						placeholder="Search courses..."
						placeholderTextColor="var(--muted)"
						value={searchQuery}
						onChangeText={setSearchQuery}
						className="ml-3 flex-1 text-foreground"
						returnKeyType="search"
					/>
					{searchQuery.length > 0 && (
						<Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
							<Ionicons name="close-circle" size={20} color="var(--muted)" />
						</Pressable>
					)}
				</View>
			</Animated.View>

			{/* Target Filter */}
			<Animated.View
				entering={FadeInDown.delay(200).duration(400)}
				className="mb-3"
			>
				<FlatList
					horizontal
					showsHorizontalScrollIndicator={false}
					data={TARGETS}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => (
						<CategoryChip
							label={item.label}
							selected={selectedTarget === item.id}
							onPress={() => setSelectedTarget(item.id)}
						/>
					)}
					ItemSeparatorComponent={() => <View className="w-2" />}
				/>
			</Animated.View>

			{/* Level Filter */}
			<Animated.View
				entering={FadeInDown.delay(300).duration(400)}
				className="mb-2"
			>
				<FlatList
					horizontal
					showsHorizontalScrollIndicator={false}
					data={LEVELS}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => (
						<Pressable
							onPress={() => setSelectedLevel(item.id)}
							className={`mr-2 rounded-full px-3 py-1.5 ${
								selectedLevel === item.id
									? "bg-primary"
									: "border border-border bg-card"
							}`}
						>
							<Text
								className={`text-sm ${
									selectedLevel === item.id
										? "font-medium text-white"
										: "text-foreground"
								}`}
							>
								{item.label}
							</Text>
						</Pressable>
					)}
				/>
			</Animated.View>

			{/* Results count */}
			{coursesData && (
				<Animated.View entering={FadeInDown.delay(400).duration(400)}>
					<Text className="mt-2 text-muted-foreground text-sm">
						{coursesData.total || 0} course
						{(coursesData.total || 0) !== 1 ? "s" : ""} found
					</Text>
				</Animated.View>
			)}
		</View>
	);

	const renderEmpty = () => {
		if (isLoading) {
			return (
				<View className="gap-4 px-4">
					<CourseCardSkeleton />
					<CourseCardSkeleton />
					<CourseCardSkeleton />
				</View>
			);
		}

		return (
			<View className="flex-1 items-center justify-center px-4 py-12">
				<Ionicons name="book-outline" size={64} color="var(--muted)" />
				<Text className="mt-4 text-center font-medium text-foreground text-lg">
					No courses found
				</Text>
				<Text className="mt-2 text-center text-muted-foreground text-sm">
					{searchQuery
						? `No courses match "${searchQuery}"`
						: "No courses available for the selected filters"}
				</Text>
				<Pressable
					onPress={() => {
						setSearchQuery("");
						setSelectedTarget("all");
						setSelectedLevel("all");
					}}
					className="mt-4 rounded-xl bg-primary px-6 py-3"
				>
					<Text className="font-medium text-white">Clear Filters</Text>
				</Pressable>
			</View>
		);
	};

	if (isError) {
		return (
			<View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
				<View className="flex-1 items-center justify-center px-4">
					<Ionicons
						name="alert-circle-outline"
						size={64}
						color="var(--danger)"
					/>
					<Text className="mt-4 text-center font-medium text-foreground text-lg">
						Failed to load courses
					</Text>
					<Text className="mt-2 text-center text-muted-foreground text-sm">
						{error?.message || "Please try again later"}
					</Text>
					<Pressable
						onPress={() => refetch()}
						className="mt-4 rounded-xl bg-primary px-6 py-3"
					>
						<Text className="font-medium text-white">Try Again</Text>
					</Pressable>
				</View>
				<BottomNavigation
					currentRoute="courses"
					onNavigate={handleNavigation}
				/>
			</View>
		);
	}

	return (
		<View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
			{/* Header */}
			<Animated.View
				entering={FadeInDown.duration(400)}
				className="flex-row items-center justify-between border-border border-b px-4 py-4"
			>
				<Pressable
					onPress={() => router.back()}
					hitSlop={8}
					className="h-10 w-10 items-center justify-center rounded-full bg-card"
				>
					<Ionicons name="arrow-back" size={20} color="var(--foreground)" />
				</Pressable>
				<Text className="font-bold text-foreground text-xl">Courses</Text>
				<View className="w-10" />
			</Animated.View>

			<FlatList
				data={coursesData?.courses || []}
				keyExtractor={(item) => item._id}
				renderItem={renderCourse}
				ListHeaderComponent={renderHeader}
				ListEmptyComponent={renderEmpty}
				contentContainerStyle={{ paddingBottom: 100 }}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						tintColor="var(--primary)"
					/>
				}
			/>

			{/* Bottom Navigation */}
			<BottomNavigation currentRoute="courses" onNavigate={handleNavigation} />
		</View>
	);
}
