import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BatchCard } from "@/components/BatchCard";
import { BottomNavigation } from "@/components/bottom-navigation";

// Mock data for batches by category
const batchesByCategory: Record<
	string,
	{
		id: string;
		title: string;
		banner: { uri: string };
		instructor: string;
		startDate: string;
		endDate: string;
		price: number;
		originalPrice: number;
		isNew: boolean;
	}[]
> = {
	jnvst: [
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
			originalPrice: 4997,
			isNew: true,
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
			originalPrice: 3997,
			isNew: true,
		},
	],
	amu: [
		{
			id: "4",
			title: "AMU Preparation Batch 2026",
			banner: {
				uri: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
			},
			instructor: "For AMU Entrance",
			startDate: "1 May",
			endDate: "30 June 2026",
			price: 4999,
			originalPrice: 5999,
			isNew: true,
		},
	],
	beu: [
		{
			id: "5",
			title: "BEU Engineering Batch 2026",
			banner: {
				uri: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=800",
			},
			instructor: "For BEU Students",
			startDate: "15 April",
			endDate: "15 July 2026",
			price: 3499,
			originalPrice: 4499,
			isNew: false,
		},
	],
	jmi: [
		{
			id: "6",
			title: "JMI Entrance Preparation 2026",
			banner: {
				uri: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800",
			},
			instructor: "For JMI Entrance",
			startDate: "10 April",
			endDate: "10 June 2026",
			price: 3999,
			originalPrice: 4999,
			isNew: true,
		},
	],
};

const categoryNames: Record<string, string> = {
	jnvst: "INSIDE JNV",
	amu: "INSIDE AMU",
	beu: "INSIDE BEU",
	jmi: "INSIDE JMI",
};

export default function CategoryDetail() {
	const insets = useSafeAreaInsets();
	const { id } = useLocalSearchParams<{ id: string }>();

	const batches = batchesByCategory[id || "jnvst"] || [];
	const categoryName = categoryNames[id || "jnvst"] || "Category";

	const handleNavigation = (route: string) => {
		if (route === "home") {
			router.push("home" as never);
		} else if (route === "batches") {
			router.push("my-batches" as never);
		} else if (route === "profile") {
			router.push("profile" as never);
		}
	};

	const handleExplore = (batchId: string) => {
		router.push({
			pathname: "course/[id]" as never,
			params: { id: batchId },
		});
	};

	const handleBuyNow = (batchId: string) => {
		// Handle purchase flow
		console.log("Buy now:", batchId);
	};

	return (
		<View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ paddingBottom: 20 }}
				showsVerticalScrollIndicator={false}
			>
				<Animated.View entering={FadeInDown} className="px-4">
					{/* Back Header */}
					<Pressable
						onPress={() => router.back()}
						className="mb-4 flex-row items-center py-3"
					>
						<Ionicons name="chevron-back" size={24} color="var(--foreground)" />
						<Text className="ml-1 font-medium text-foreground text-lg">
							Back
						</Text>
					</Pressable>

					{/* Category Title - Hidden but kept for accessibility */}
					<Text className="sr-only">{categoryName}</Text>

					{/* Batch List */}
					{batches.map((batch) => (
						<BatchCard
							key={batch.id}
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
					))}

					{batches.length === 0 && (
						<View className="flex-1 items-center justify-center py-20">
							<Ionicons name="book-outline" size={48} color="var(--muted)" />
							<Text className="mt-4 text-muted-foreground">
								No batches available in this category
							</Text>
						</View>
					)}
				</Animated.View>
			</ScrollView>

			{/* Bottom Navigation */}
			<BottomNavigation currentRoute="home" onNavigate={handleNavigation} />
		</View>
	);
}
