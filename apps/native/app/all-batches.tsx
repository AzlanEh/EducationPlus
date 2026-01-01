import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BatchCard } from "@/components/BatchCard";
import { BottomNavigation } from "@/components/bottom-navigation";

// Mock data for all available batches
const allBatches = [
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

	const handleNavigation = (route: string) => {
		if (route === "home") {
			router.push("home" as never);
		} else if (route === "profile") {
			router.push("profile" as never);
		} else if (route === "batches") {
			router.push("my-batches" as never);
		}
	};

	const handleExplore = (batchId: string) => {
		router.push({
			pathname: "batch-detail/[id]" as never,
			params: { id: batchId },
		});
	};

	const handleBuyNow = (batchId: string) => {
		// Navigate to purchase flow
		router.push({
			pathname: "batch/[id]" as never,
			params: { id: batchId },
		});
	};

	return (
		<View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
			{/* Header */}
			<View className="border-border border-b bg-amber-400 px-4 py-3">
				<Text className="font-semibold text-foreground text-sm uppercase tracking-wide">
					Batch Buy Time
				</Text>
			</View>

			<ScrollView
				className="flex-1"
				contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
				showsVerticalScrollIndicator={false}
			>
				<Animated.View entering={FadeInDown} className="flex-1 px-4">
					{/* Back Button */}
					<Pressable
						onPress={() => router.back()}
						className="mb-4 flex-row items-center py-3"
					>
						<Ionicons name="chevron-back" size={24} color="#0f172a" />
						<Text className="ml-1 font-medium text-foreground text-lg">
							Back
						</Text>
					</Pressable>

					{/* Batches List */}
					{allBatches.map((batch, index) => (
						<Animated.View
							key={batch.id}
							entering={FadeInDown.delay(index * 100)}
						>
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
						</Animated.View>
					))}

					{allBatches.length === 0 && (
						<View className="flex-1 items-center justify-center py-20">
							<Ionicons name="calendar-outline" size={48} color="#94a3b8" />
							<Text className="mt-4 text-center text-muted">
								No batches available at the moment.
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
