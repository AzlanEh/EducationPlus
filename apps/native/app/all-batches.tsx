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
import { BatchCard } from "@/components/BatchCard";
import { BottomNavigation } from "@/components/bottom-navigation";
import { BatchCardSkeleton, NoBatchesEmptyState } from "@/components/ui";
import { useAppTheme } from "@/contexts/app-theme-context";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Mock data for all available batches
const allBatchesData = [
	{
		id: "1",
		title: "Jnvst TITAN 2.0 2026",
		banner: {
			uri: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800",
		},
		instructor: "For Jnvst Class 9th",
		startDate: "7 April",
		endDate: "30 April 2026",
		price: 2999,
		originalPrice: 3997,
		isNew: true,
		subject: "MATHS",
	},
	{
		id: "2",
		title: "Jnvst TITAN 2.0 2026",
		banner: {
			uri: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800",
		},
		instructor: "For Jnvst Class 9th",
		startDate: "7 April",
		endDate: "30 April 2026",
		price: 3999,
		isNew: true,
		subject: "BIOLOGY",
	},
	{
		id: "3",
		title: "Jnvst TITAN 2.0 2026",
		banner: {
			uri: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800",
		},
		instructor: "For Jnvst Class 9th",
		startDate: "7 April",
		endDate: "30 April 2026",
		price: 2999,
		isNew: false,
		subject: "PHYSICS",
	},
];

export default function AllBatches() {
	const insets = useSafeAreaInsets();
	const [isLoading] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [batches, setBatches] = useState(allBatchesData);
	const { colors } = useAppTheme();

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
		} else if (route === "batches") {
			router.push("my-batches" as never);
		}
	};

	const handleExplore = (batchId: string) => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		router.push({
			pathname: "batch-detail/[id]" as never,
			params: { id: batchId },
		});
	};

	const handleBuyNow = (batchId: string) => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
			setBatches(allBatchesData);
			setIsRefreshing(false);
		}, 1500);
	}, []);

	return (
		<View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
			{/* Header Banner */}
			<View className="border-border border-b bg-warning/90 px-4 py-3">
				<View className="flex-row items-center justify-between">
					<View className="flex-row items-center">
						<Ionicons name="flash" size={20} color="var(--foreground)" />
						<Text className="ml-2 font-bold text-foreground text-sm uppercase tracking-wide">
							Batch Buy Time
						</Text>
					</View>
					<View className="rounded-full bg-foreground/10 px-2 py-0.5">
						<Text className="font-medium text-foreground text-xs">
							{batches.length} Available
						</Text>
					</View>
				</View>
			</View>

			<ScrollView
				className="flex-1"
				contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={isRefreshing}
						onRefresh={onRefresh}
						tintColor={colors.primary}
						colors={[colors.primary]}
					/>
				}
			>
				<View className="flex-1 px-4">
					{/* Back Button */}
					<AnimatedPressable
						style={backButtonAnimatedStyle}
						onPress={handleBackPress}
						onPressIn={() => {
							backButtonScale.value = withSpring(0.95);
						}}
						onPressOut={() => {
							backButtonScale.value = withSpring(1);
						}}
						className="mb-2 flex-row items-center py-3"
						accessibilityLabel="Go back"
						accessibilityRole="button"
					>
						<Ionicons name="chevron-back" size={24} color="var(--foreground)" />
						<Text className="ml-1 font-medium text-foreground text-lg">
							Back
						</Text>
					</AnimatedPressable>

					{/* Title */}
					<View className="mb-4 flex-row items-center justify-between">
						<Text className="font-bold text-2xl text-foreground">
							All Batches
						</Text>
						<Pressable
							onPress={() => {
								Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
								// Open filter modal
							}}
							className="flex-row items-center rounded-full bg-secondary px-3 py-1.5"
							accessibilityLabel="Filter batches"
						>
							<Ionicons name="filter" size={16} color="var(--foreground)" />
							<Text className="ml-1 font-medium text-foreground text-sm">
								Filter
							</Text>
						</Pressable>
					</View>

					{/* Batches List */}
					{isLoading ? (
						<View className="gap-4">
							<BatchCardSkeleton />
							<BatchCardSkeleton />
							<BatchCardSkeleton />
						</View>
					) : batches.length > 0 ? (
						// Batches List
						batches.map((batch, index) => (
							<View key={batch.id}>
								<BatchCard
									banner={batch.banner}
									title={batch.title}
									instructor={batch.instructor}
									startDate={batch.startDate}
									endDate={batch.endDate}
									price={batch.price}
									originalPrice={batch.originalPrice}
									isNew={batch.isNew}
									onExplore={() => handleExplore(batch.id)}
									onBuyNow={() => handleBuyNow(batch.id)}
								/>
							</View>
						))
					) : (
						<NoBatchesEmptyState
							title="No Batches Available"
							description="Check back later for new batches and courses."
						/>
					)}
				</View>
			</ScrollView>

			{/* Bottom Navigation */}
			<BottomNavigation currentRoute="home" onNavigate={handleNavigation} />
		</View>
	);
}
