import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomNavigation } from "@/components/bottom-navigation";
import { EnrolledBatchCard } from "@/components/enrolled-batch-card";

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

	const handleNavigation = (route: string) => {
		if (route === "home") {
			router.push("home" as never);
		} else if (route === "profile") {
			router.push("profile" as never);
		}
	};

	const handleViewClasses = (batchId: string) => {
		router.push({
			pathname: "batch/[id]" as never,
			params: { id: batchId },
		});
	};

	return (
		<View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
				showsVerticalScrollIndicator={false}
			>
				<Animated.View entering={FadeInDown} className="flex-1 px-4">
					{/* Back Header */}
					<Pressable
						onPress={() => router.back()}
						className="mb-4 flex-row items-center py-3"
					>
						<Ionicons name="chevron-back" size={24} color="#0f172a" />
						<Text className="ml-1 font-medium text-foreground text-lg">
							Back
						</Text>
					</Pressable>

					{/* Enrolled Batches List */}
					{enrolledBatches.map((batch) => (
						<EnrolledBatchCard
							key={batch.id}
							banner={batch.banner}
							title={batch.title}
							instructor={batch.instructor}
							purchaseDate={batch.purchaseDate}
							timing={batch.timing}
							onViewClasses={() => handleViewClasses(batch.id)}
						/>
					))}

					{enrolledBatches.length === 0 && (
						<View className="flex-1 items-center justify-center py-20">
							<Ionicons name="calendar-outline" size={48} color="#94a3b8" />
							<Text className="mt-4 text-center text-muted">
								You haven't enrolled in any batches yet.
							</Text>
							<Pressable
								onPress={() => router.push("categories" as never)}
								className="mt-4 rounded-lg bg-primary px-6 py-3"
							>
								<Text className="font-semibold text-white">Browse Batches</Text>
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
