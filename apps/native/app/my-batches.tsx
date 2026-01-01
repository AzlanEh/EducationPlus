import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
	Pressable,
	RefreshControl,
	ScrollView,
	Text,
	View,
} from "react-native";
import Animated, {
	FadeInDown,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomNavigation } from "@/components/bottom-navigation";
import { EnrolledBatchCard } from "@/components/enrolled-batch-card";
import { BatchCardSkeleton, NoBatchesEmptyState } from "@/components/ui";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Mock data for enrolled batches
const enrolledBatches = [
	{
		id: "1",
		title: "Jnvst TITAN 2.0 2026",
		banner: {
			uri: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800",
		},
		instructor: "For Jnvst Class 9th",
		purchaseDate: "1 Nov 2025",
		timing: "7:00 PM to 9:00 PM",
	},
];

export default function MyBatches() {
	const insets = useSafeAreaInsets();
	const [isLoading, setIsLoading] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [batches, setBatches] = useState(enrolledBatches);

	// Animation for back button
	const backButtonScale = useSharedValue(1);
	const backButtonAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: backButtonScale.value }],
	}));

	const handleNavigation = (route: string) => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		if (route === "home") {
			router.push("home" as never);
		} else if (route === "profile") {
			router.push("profile" as never);
		}
	};

	const handleViewClasses = (batchId: string) => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		router.push({
			pathname: "batch/[id]" as never,
			params: { id: batchId },
		});
	};

	const handleBackPress = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		router.back();
	};

	const onRefresh = useCallback(() => {
		setIsRefreshing(true);
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

		// Simulate API call
		setTimeout(() => {
			setBatches(enrolledBatches);
			setIsRefreshing(false);
		}, 1500);
	}, []);

	return (
		<View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={isRefreshing}
						onRefresh={onRefresh}
						tintColor="var(--primary)"
						colors={["#1a3a2f"]}
					/>
				}
			>
				<View className="flex-1 px-4">
					{/* Back Header */}
					<AnimatedPressable
						style={backButtonAnimatedStyle}
						onPress={handleBackPress}
						onPressIn={() => {
							backButtonScale.value = withSpring(0.95);
						}}
						onPressOut={() => {
							backButtonScale.value = withSpring(1);
						}}
						className="mb-4 flex-row items-center py-3"
						accessibilityLabel="Go back"
						accessibilityRole="button"
					>
						<Ionicons name="chevron-back" size={24} color="var(--foreground)" />
						<Text className="ml-1 font-medium text-foreground text-lg">
							Back
						</Text>
					</AnimatedPressable>

					{/* Title */}
					<Text className="mb-4 font-bold text-2xl text-foreground">
						My Batches
					</Text>

					{/* Loading State */}
					{isLoading ? (
						<View className="gap-4">
							<BatchCardSkeleton />
							<BatchCardSkeleton />
						</View>
					) : batches.length > 0 ? (
						// Enrolled Batches List
						batches.map((batch, index) => (
							<Animated.View
								key={batch.id}
								entering={FadeInDown.delay(index * 100).duration(400)}
							>
								<EnrolledBatchCard
									banner={batch.banner}
									title={batch.title}
									instructor={batch.instructor}
									purchaseDate={batch.purchaseDate}
									timing={batch.timing}
									onViewClasses={() => handleViewClasses(batch.id)}
								/>
							</Animated.View>
						))
					) : (
						// Empty State
						<NoBatchesEmptyState
							onAction={() => {
								Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
								router.push("all-batches" as never);
							}}
						/>
					)}
				</View>
			</ScrollView>

			{/* Bottom Navigation */}
			<BottomNavigation currentRoute="batches" onNavigate={handleNavigation} />
		</View>
	);
}
