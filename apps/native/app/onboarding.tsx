import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import {
	Dimensions,
	Image,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native";
import Animated, {
	FadeIn,
	FadeInDown,
	FadeInUp,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

/**
 * Legacy Onboarding Screen - Reference Implementation
 *
 * NOTE: This file is kept as a reference for the original design.
 * The app now uses the new home.tsx screen as the main landing page.
 *
 * If you need to use this screen, it has been updated to:
 * - Use @expo/vector-icons instead of react-native-vector-icons
 * - Use NativeWind/Tailwind CSS classes
 * - Use react-native-safe-area-context instead of SafeAreaView
 */

// Category data
const categories = [
	{ name: "AMU", color: "#e8f5e9", icon: "school" as const },
	{ name: "CBSE", color: "#e3f2fd", icon: "book-open-variant" as const },
	{ name: "JNVST", color: "#fff3e0", icon: "bank" as const },
	{ name: "BEU", color: "#f3e5f5", icon: "domain" as const },
];

// Grid items data
const gridItems = [
	{ title: "Study Material", icon: "bookshelf" as const, color: "#4CAF50" },
	{ title: "Ask Doubts", icon: "chat-question" as const, color: "#2196F3" },
	{
		title: "Test & Quizzes",
		icon: "clipboard-check" as const,
		color: "#FF9800",
	},
	{ title: "Free Live Classes", icon: "youtube-tv" as const, color: "#E91E63" },
	{ title: "PYQ", icon: "file-document" as const, color: "#607D8B" },
	{ title: "Free Classes", icon: "play-box" as const, color: "#9C27B0" },
];

// Nav items data
const navItems = [
	{ name: "Home", icon: "home" as const, active: true },
	{ name: "Performance", icon: "chart-bar" as const, active: false },
	{ name: "My Batches", icon: "layers" as const, active: false },
	{ name: "Profile", icon: "account" as const, active: false },
];

type CategoryItemProps = {
	name: string;
	icon: keyof typeof MaterialCommunityIcons.glyphMap;
	color: string;
};

type GridItemProps = {
	title: string;
	icon: keyof typeof MaterialCommunityIcons.glyphMap;
	color: string;
};

type NavItemProps = {
	name: string;
	icon: keyof typeof MaterialCommunityIcons.glyphMap;
	active: boolean;
};

function CategoryItem({ name, icon }: CategoryItemProps) {
	return (
		<Pressable
			onPress={() => {
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
			}}
			className="items-center"
			style={{ width: width / 4.8 }}
		>
			<View className="mb-2 h-[60px] w-[60px] items-center justify-center rounded-xl border border-border bg-card shadow-sm">
				<MaterialCommunityIcons
					name={icon}
					size={30}
					color="var(--foreground)"
				/>
			</View>
			<Text className="font-bold text-foreground text-xs">{name}</Text>
		</Pressable>
	);
}

function GridItem({ title, icon, color }: GridItemProps) {
	return (
		<Pressable
			onPress={() => {
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
			}}
			className="mb-5 w-[30%] items-center"
		>
			<MaterialCommunityIcons name={icon} size={40} color={color} />
			<Text className="mt-2 text-center text-foreground text-xs leading-4">
				{title.replace(" ", "\n")}
			</Text>
		</Pressable>
	);
}

function NavItem({ name, icon, active }: NavItemProps) {
	return (
		<Pressable
			onPress={() => {
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
			}}
			className="items-center"
		>
			<MaterialCommunityIcons
				name={icon}
				size={24}
				color={active ? "var(--primary)" : "var(--muted-foreground)"}
			/>
			<Text
				className={`mt-1 text-xs ${
					active ? "text-primary" : "text-muted-foreground"
				}`}
			>
				{name}
			</Text>
		</Pressable>
	);
}

export default function OnboardingScreen() {
	const insets = useSafeAreaInsets();

	return (
		<View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
			{/* Main Scrollable Content */}
			<ScrollView
				contentContainerStyle={{ padding: 16 }}
				showsVerticalScrollIndicator={false}
			>
				{/* Header */}
				<Animated.View
					entering={FadeIn.duration(400)}
					className="mb-4 flex-row items-center justify-between"
				>
					<Text className="font-black text-foreground text-lg">
						EDUCATION PLUS+
					</Text>
					<Pressable
						onPress={() => {
							Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
						}}
						className="relative"
					>
						<Ionicons
							name="notifications-outline"
							size={26}
							color="var(--foreground)"
						/>
						<View className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-danger" />
					</Pressable>
				</Animated.View>

				{/* Top Banner */}
				<Animated.View
					entering={FadeInDown.delay(100).duration(400)}
					className="mb-4 overflow-hidden rounded-xl shadow-md"
				>
					<Image
						source={{
							uri: "https://via.placeholder.com/350x180/003366/ffffff?text=Discrete+Mathematics+Banner",
						}}
						className="h-[180px] w-full"
						resizeMode="cover"
					/>
				</Animated.View>

				{/* Search Bar */}
				<Animated.View
					entering={FadeInDown.delay(200).duration(400)}
					className="mb-5 h-11 flex-row items-center rounded-full border border-border bg-card px-4"
				>
					<Ionicons
						name="search"
						size={20}
						color="var(--muted-foreground)"
						style={{ marginRight: 10 }}
					/>
					<TextInput
						placeholder="Search"
						placeholderTextColor="var(--muted)"
						className="flex-1 text-foreground"
					/>
				</Animated.View>

				{/* Categories */}
				<Animated.View
					entering={FadeInDown.delay(300).duration(400)}
					className="mb-3 flex-row items-center justify-between"
				>
					<Text className="font-bold text-base text-foreground">
						Categories
					</Text>
					<Pressable
						onPress={() => {
							Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
							router.push("/categories" as never);
						}}
					>
						<Text className="font-semibold text-primary text-xs">View All</Text>
					</Pressable>
				</Animated.View>

				<Animated.View
					entering={FadeInDown.delay(400).duration(400)}
					className="mb-6 flex-row justify-between"
				>
					{categories.map((cat) => (
						<CategoryItem key={cat.name} {...cat} />
					))}
				</Animated.View>

				{/* Trending Batches */}
				<Animated.View
					entering={FadeInDown.delay(500).duration(400)}
					className="mb-3 flex-row items-center justify-between"
				>
					<Text className="font-bold text-base text-foreground">
						Trending Batches
					</Text>
					<Pressable
						onPress={() => {
							Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
							router.push("/all-batches" as never);
						}}
					>
						<Text className="font-semibold text-primary text-xs">View All</Text>
					</Pressable>
				</Animated.View>

				{/* Batch Card */}
				<Animated.View
					entering={FadeInUp.delay(600).duration(400)}
					className="mb-2.5 overflow-hidden rounded-xl bg-card shadow-md"
				>
					<View className="relative">
						<Text className="absolute top-2.5 right-2.5 z-10 rounded bg-warning px-2 py-1 font-bold text-[10px] text-foreground">
							New
						</Text>
						<Image
							source={{
								uri: "https://via.placeholder.com/350x150/800000/ffffff?text=Physics+Force+%26+Pressure",
							}}
							className="h-[140px] w-full"
						/>
					</View>
					<View className="p-3">
						<Text className="mb-2 font-bold text-base text-foreground">
							JNVST TITAN 2.0 2026
						</Text>
						<View className="mb-1 flex-row items-center">
							<MaterialCommunityIcons
								name="home-variant"
								size={14}
								color="var(--muted-foreground)"
							/>
							<Text className="ml-1 text-muted-foreground text-xs">
								For Jnvst Class 9th
							</Text>
						</View>
						<View className="mb-1 flex-row items-center">
							<MaterialCommunityIcons
								name="calendar"
								size={14}
								color="var(--muted-foreground)"
							/>
							<Text className="ml-1 text-muted-foreground text-xs">
								Starts on 7 April | Ends on 30 April 2026
							</Text>
						</View>

						<View className="mt-3 flex-row items-center justify-between border-border border-t pt-3">
							<View>
								<Text className="font-bold text-foreground text-lg">
									₹ 2999
								</Text>
								<Text className="text-[10px] text-danger line-through">
									55% OFF
								</Text>
							</View>
							<View className="flex-row gap-2.5">
								<Pressable
									onPress={() => {
										Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
									}}
									className="rounded-md border border-primary px-3 py-1.5"
								>
									<Text className="font-bold text-primary text-xs">
										EXPLORE
									</Text>
								</Pressable>
								<Pressable
									onPress={() => {
										Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
									}}
									className="rounded-md bg-primary px-4 py-1.5"
								>
									<Text className="font-bold text-white text-xs">BUY NOW</Text>
								</Pressable>
							</View>
						</View>
					</View>
				</Animated.View>

				{/* Study Grid Menu */}
				<Animated.View entering={FadeInUp.delay(700).duration(400)}>
					<Text className="mt-6 mb-4 font-bold text-base text-foreground">
						Study With Education Plus+
					</Text>
					<View className="flex-row flex-wrap justify-between">
						{gridItems.map((item) => (
							<GridItem key={item.title} {...item} />
						))}
					</View>
				</Animated.View>

				{/* Refer & Earn Banner */}
				<Animated.View
					entering={FadeInUp.delay(800).duration(400)}
					className="my-5 flex-row items-center justify-between rounded-xl bg-card p-4 shadow-sm"
				>
					<View>
						<Text className="text-muted-foreground text-xs">
							Refer to your friends &
						</Text>
						<Text className="mb-2.5 font-bold text-base text-foreground">
							Earn Plus+ Coins!
						</Text>
						<Pressable
							onPress={() => {
								Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
							}}
							className="flex-row items-center self-start rounded-full border border-border px-3 py-1.5"
						>
							<MaterialCommunityIcons
								name="whatsapp"
								size={18}
								color="#25D366"
							/>
							<Text className="ml-1 font-bold text-foreground text-xs">
								Share Now
							</Text>
						</Pressable>
					</View>
					<Image
						source={{
							uri: "https://via.placeholder.com/100x100/transparent/000000?text=Kids",
						}}
						className="h-20 w-20"
						resizeMode="contain"
					/>
				</Animated.View>

				{/* Footer Tagline */}
				<Animated.View
					entering={FadeInUp.delay(900).duration(400)}
					className="my-5 items-center"
				>
					<Text className="text-center font-black text-2xl text-muted/30">
						Give Wings to Your Dream !
					</Text>
					<Text className="-mt-2.5 bg-surface px-1 text-foreground text-xs">
						With ❤️ Education Plus+
					</Text>
				</Animated.View>

				{/* Contact Button */}
				<Animated.View entering={FadeInUp.delay(1000).duration(400)}>
					<Pressable
						onPress={() => {
							Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
						}}
						className="mb-5 flex-row items-center self-center rounded-full border border-border bg-card px-5 py-2"
					>
						<MaterialCommunityIcons name="phone" size={16} color="#25D366" />
						<Text className="ml-1 font-semibold text-foreground">
							Contact Us
						</Text>
					</Pressable>
				</Animated.View>

				{/* Padding for bottom nav */}
				<View className="h-20" />
			</ScrollView>

			{/* Bottom Navigation */}
			<View
				className="absolute right-0 bottom-0 left-0 flex-row justify-around border-border border-t bg-card py-2.5"
				style={{ paddingBottom: insets.bottom + 10 }}
			>
				{navItems.map((item) => (
					<NavItem key={item.name} {...item} />
				))}
			</View>
		</View>
	);
}
