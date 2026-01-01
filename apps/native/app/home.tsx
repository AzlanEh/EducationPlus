import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { cn } from "heroui-native";
import { useState } from "react";
import {
	Image,
	Linking,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BatchCard } from "@/components/BatchCard";
import { BottomNavigation } from "@/components/bottom-navigation";
import { CategoryCard } from "@/components/CategoryCard";
import { FeatureCard } from "@/components/feature-card";
import { ReferralBanner } from "@/components/referral-banner";
import { ThemeToggle } from "@/components/theme-toggle";

// Mock data for categories
const categories = [
	{
		id: "1",
		title: "AMU",
		icon: { uri: "https://via.placeholder.com/64/4CAF50/FFFFFF?text=AMU" },
	},
	{
		id: "2",
		title: "CBSE",
		icon: { uri: "https://via.placeholder.com/64/2196F3/FFFFFF?text=CBSE" },
	},
	{
		id: "3",
		title: "JNVST",
		icon: { uri: "https://via.placeholder.com/64/FF9800/FFFFFF?text=JNVST" },
	},
	{
		id: "4",
		title: "BEU",
		icon: { uri: "https://via.placeholder.com/64/9C27B0/FFFFFF?text=BEU" },
	},
];

// Mock data for batches
const trendingBatches = [
	{
		id: "1",
		title: "TITAN 2.0 2026",
		banner: {
			uri: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800",
		},
		instructor: "For level: Class 9th",
		startDate: "7 April",
		endDate: "30 April 2026",
		price: 2999,
		originalPrice: 3997,
		isNew: true,
	},
];

// Mock data for features
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

	const handleNavigation = (route: string) => {
		if (route === "profile") {
			router.push("profile" as never);
		} else if (route === "batches") {
			router.push("courses" as never);
		}
		// Other routes can be added as screens are created
	};

	const handleContactUs = () => {
		Linking.openURL("https://wa.me/1234567890");
	};

	return (
		<View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ paddingBottom: 20 }}
				showsVerticalScrollIndicator={false}
			>
				<Animated.View entering={FadeInDown} className="px-4">
					{/* Header */}
					<View className="mb-4 flex-row items-center justify-between py-3">
						<Text className="font-bold text-foreground text-lg">
							EDUCATION PLUS+
						</Text>
						<ThemeToggle />
					</View>

					{/* Hero Banner */}
					<Pressable className="mb-4 overflow-hidden rounded-2xl">
						<Image
							source={{
								uri: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800",
							}}
							style={{ width: "100%", height: 180 }}
							resizeMode="cover"
							className="rounded-2xl"
						/>
						<View className="absolute inset-0 justify-end bg-black/30 p-4">
							<Text className="font-bold text-white text-xl">
								DISCRETE MATHEMATICS
							</Text>
							<Text className="font-semibold text-base text-white/90">
								SET THEORY
							</Text>
							<Text className="text-sm text-white/80">
								SEMESTER EXAM - LECTURE 1
							</Text>
						</View>
					</Pressable>

					{/* Search Bar */}
					<View className="mb-6 flex-row items-center rounded-full border border-border bg-secondary px-4 py-3">
						<Ionicons name="search-outline" size={20} color="#94a3b8" />
						<TextInput
							placeholder="Search"
							placeholderTextColor="#94a3b8"
							value={searchQuery}
							onChangeText={setSearchQuery}
							className="ml-3 flex-1 text-foreground"
						/>
					</View>

					{/* Categories Section */}
					<View className="mb-6">
						<View className="mb-3 flex-row items-center justify-between">
							<Text className="font-semibold text-base text-foreground">
								Categories
							</Text>
							<Pressable>
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
							{categories.map((category) => (
								<CategoryCard
									key={category.id}
									title={category.title}
									icon={category.icon}
									onPress={() => router.push("courses" as never)}
								/>
							))}
						</ScrollView>
					</View>

					{/* Trending Batches Section */}
					<View className="mb-6">
						<View className="mb-3 flex-row items-center justify-between">
							<Text className="font-semibold text-base text-foreground">
								Trending Batches
							</Text>
							<Pressable>
								<Text className="font-medium text-primary text-sm">
									View All
								</Text>
							</Pressable>
						</View>
						{trendingBatches.map((batch) => (
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
								onExplore={() => router.push("courses" as never)}
								onBuyNow={() => router.push("courses" as never)}
							/>
						))}
					</View>

					{/* Study With Education Plus+ Section */}
					<View className="mb-6">
						<Text className="mb-4 font-semibold text-base text-foreground">
							Study With Education Plus+
						</Text>
						<View className="flex-row flex-wrap justify-between">
							{studyFeatures.slice(0, 3).map((feature) => (
								<FeatureCard
									key={feature.id}
									title={feature.title}
									icon={feature.icon}
									className="mb-4"
								/>
							))}
						</View>
						<View className="flex-row flex-wrap justify-between">
							{studyFeatures.slice(3, 6).map((feature) => (
								<FeatureCard
									key={feature.id}
									title={feature.title}
									icon={feature.icon}
									className="mb-4"
								/>
							))}
						</View>
					</View>

					{/* Referral Banner */}
					<ReferralBanner onSharePress={() => {}} />

					{/* Footer Section */}
					<View className="mb-6 items-center">
						<Text
							className="font-bold text-2xl"
							style={{
								color: "#FF9800",
							}}
						>
							Give Wings to Your Dream !
						</Text>
						<View className="mt-1 flex-row items-center">
							<Text className="text-foreground text-sm">With </Text>
							<Ionicons name="heart" size={14} color="#ef4444" />
							<Text className="font-semibold text-primary text-sm">
								{" "}
								Education Plus+
							</Text>
						</View>
					</View>

					{/* Contact Button */}
					<Pressable
						onPress={handleContactUs}
						className={cn(
							"mb-4 flex-row items-center justify-center self-start",
							"rounded-full border border-success px-5 py-3",
						)}
					>
						<Ionicons name="logo-whatsapp" size={18} color="#22c55e" />
						<Text className="ml-2 font-semibold text-success">Contact Us</Text>
					</Pressable>
				</Animated.View>
			</ScrollView>

			{/* Bottom Navigation */}
			<BottomNavigation currentRoute="home" onNavigate={handleNavigation} />
		</View>
	);
}
