import { Ionicons } from "@expo/vector-icons";
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
import { BatchCard } from "@/components/BatchCard";
import { BottomNavigation } from "@/components/bottom-navigation";
import { CategoryCard } from "@/components/CategoryCard";
import { FeatureCard } from "@/components/feature-card";
import { ReferralBanner } from "@/components/referral-banner";
import { ThemeToggle } from "@/components/theme-toggle";
import { Header } from "@/components/ui/header";

// Mock data for categories
const categories = [
	{
		id: "amu",
		title: "AMU",
		icon: { uri: "https://via.placeholder.com/64/4CAF50/FFFFFF?text=AMU" },
	},
	{
		id: "cbse",
		title: "CBSE",
		icon: { uri: "https://via.placeholder.com/64/2196F3/FFFFFF?text=CBSE" },
	},
	{
		id: "jnvst",
		title: "JNVST",
		icon: { uri: "https://via.placeholder.com/64/FF9800/FFFFFF?text=JNVST" },
	},
	{
		id: "beu",
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
		rating: 4.8,
		reviewCount: 2340,
		enrolledCount: 5200,
	},
	{
		id: "2",
		title: "Foundation Batch 2026",
		banner: {
			uri: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
		},
		instructor: "For level: Class 10th",
		startDate: "15 April",
		endDate: "30 May 2026",
		price: 4999,
		originalPrice: 6999,
		isPopular: true,
		rating: 4.6,
		reviewCount: 1820,
		enrolledCount: 3400,
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

// Mock user data
const mockUser = {
	name: "Rahul Kumar",
	image: undefined,
};

export default function Home() {
	const insets = useSafeAreaInsets();
	const [searchQuery, setSearchQuery] = useState("");
	const [refreshing, setRefreshing] = useState(false);
	const [notificationCount] = useState(3);

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		// Simulate API refresh
		setTimeout(() => {
			setRefreshing(false);
		}, 1500);
	}, []);

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
		// Navigate to notifications
		console.log("Notifications pressed");
	};

	const handleProfilePress = () => {
		router.push("profile" as never);
	};

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
						tintColor="var(--primary)"
						colors={["#1a3a2f"]}
					/>
				}
			>
				<View className="px-4">
					{/* Header with User Greeting */}
					<Animated.View entering={FadeInDown.delay(0).duration(400)}>
						<Header
							userName={mockUser.name}
							userImage={mockUser.image}
							notificationCount={notificationCount}
							onNotificationPress={handleNotificationPress}
							onProfilePress={handleProfilePress}
							rightContent={<ThemeToggle />}
						/>
					</Animated.View>

					{/* Hero Banner */}
					<Animated.View entering={FadeInDown.delay(100).duration(400)}>
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
					</Animated.View>

					{/* Search Bar */}
					<Animated.View entering={FadeInDown.delay(200).duration(400)}>
						<View className="mb-6 flex-row items-center rounded-full border border-border bg-card px-4 py-3 shadow-sm">
							<Ionicons
								name="search-outline"
								size={20}
								color="var(--muted-foreground)"
							/>
							<TextInput
								placeholder="Search batches, courses..."
								placeholderTextColor="var(--muted)"
								value={searchQuery}
								onChangeText={setSearchQuery}
								className="ml-3 flex-1 text-foreground"
								accessibilityLabel="Search"
								returnKeyType="search"
							/>
							{searchQuery.length > 0 && (
								<Pressable
									onPress={() => setSearchQuery("")}
									hitSlop={8}
									accessibilityLabel="Clear search"
								>
									<Ionicons
										name="close-circle"
										size={20}
										color="var(--muted)"
									/>
								</Pressable>
							)}
						</View>
					</Animated.View>

					{/* Categories Section */}
					<Animated.View
						entering={FadeInDown.delay(300).duration(400)}
						className="mb-6"
					>
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
								<Animated.View
									key={category.id}
									entering={FadeInUp.delay(300 + index * 50).duration(400)}
								>
									<CategoryCard
										title={category.title}
										icon={category.icon}
										onPress={() =>
											router.push({
												pathname: "category/[id]" as never,
												params: { id: category.id },
											})
										}
									/>
								</Animated.View>
							))}
						</ScrollView>
					</Animated.View>

					{/* Trending Batches Section */}
					<Animated.View
						entering={FadeInDown.delay(400).duration(400)}
						className="mb-6"
					>
						<View className="mb-3 flex-row items-center justify-between">
							<View className="flex-row items-center">
								<Text className="font-semibold text-base text-foreground">
									Trending Batches
								</Text>
								<View className="ml-2 flex-row items-center rounded-full bg-danger/10 px-2 py-0.5">
									<Ionicons name="flame" size={12} color="var(--danger)" />
									<Text className="ml-1 font-medium text-danger text-xs">
										Hot
									</Text>
								</View>
							</View>
							<Pressable
								onPress={() => router.push("all-batches" as never)}
								hitSlop={8}
								accessibilityRole="button"
							>
								<Text className="font-medium text-primary text-sm">
									View All
								</Text>
							</Pressable>
						</View>
						{trendingBatches.map((batch, index) => (
							<Animated.View
								key={batch.id}
								entering={FadeInUp.delay(400 + index * 100).duration(400)}
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
									isPopular={batch.isPopular}
									rating={batch.rating}
									reviewCount={batch.reviewCount}
									enrolledCount={batch.enrolledCount}
									onExplore={() =>
										router.push({
											pathname: "batch-detail/[id]" as never,
											params: { id: batch.id },
										})
									}
									onBuyNow={() =>
										router.push({
											pathname: "payment/[id]" as never,
											params: { id: batch.id },
										})
									}
								/>
							</Animated.View>
						))}
					</Animated.View>

					{/* Study With Education Plus+ Section */}
					<Animated.View
						entering={FadeInDown.delay(500).duration(400)}
						className="mb-6"
					>
						<Text className="mb-4 font-semibold text-base text-foreground">
							Study With Education Plus+
						</Text>
						<View className="flex-row flex-wrap justify-between">
							{studyFeatures.slice(0, 3).map((feature, index) => (
								<Animated.View
									key={feature.id}
									entering={FadeInUp.delay(500 + index * 50).duration(300)}
								>
									<FeatureCard
										title={feature.title}
										icon={feature.icon}
										className="mb-4"
									/>
								</Animated.View>
							))}
						</View>
						<View className="flex-row flex-wrap justify-between">
							{studyFeatures.slice(3, 6).map((feature, index) => (
								<Animated.View
									key={feature.id}
									entering={FadeInUp.delay(600 + index * 50).duration(300)}
								>
									<FeatureCard
										title={feature.title}
										icon={feature.icon}
										className="mb-4"
									/>
								</Animated.View>
							))}
						</View>
					</Animated.View>

					{/* Referral Banner */}
					<Animated.View entering={FadeInDown.delay(600).duration(400)}>
						<ReferralBanner onSharePress={() => {}} />
					</Animated.View>

					{/* Footer Section */}
					<Animated.View
						entering={FadeInDown.delay(700).duration(400)}
						className="mb-6 items-center"
					>
						<Text className="font-bold text-2xl text-accent-orange">
							Give Wings to Your Dream!
						</Text>
						<View className="mt-1 flex-row items-center">
							<Text className="text-foreground text-sm">With </Text>
							<Ionicons name="heart" size={14} color="var(--danger)" />
							<Text className="font-semibold text-accent text-sm">
								{" "}
								Education Plus+
							</Text>
						</View>
					</Animated.View>

					{/* Contact Button */}
					<Animated.View entering={FadeInDown.delay(800).duration(400)}>
						<Pressable
							onPress={handleContactUs}
							accessibilityRole="button"
							accessibilityLabel="Contact us on WhatsApp"
							className={cn(
								"mb-4 flex-row items-center justify-center self-start",
								"rounded-full border border-success px-5 py-3 active:bg-success/10",
							)}
						>
							<Ionicons name="logo-whatsapp" size={18} color="var(--success)" />
							<Text className="ml-2 font-semibold text-success">
								Contact Us
							</Text>
						</Pressable>
					</Animated.View>
				</View>
			</ScrollView>

			{/* Bottom Navigation */}
			<BottomNavigation currentRoute="home" onNavigate={handleNavigation} />
		</View>
	);
}
