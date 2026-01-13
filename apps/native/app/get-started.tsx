import { router } from "expo-router";
import { useRef, useState } from "react";
import {
	Dimensions,
	FlatList,
	Image,
	Pressable,
	Text,
	View,
	type ViewToken,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// Education Plus+ Logo Image
const logoImage = require("@/assets/images/logo.png");

type SlideData = {
	id: string;
	type: "logo" | "image";
	imageUri?: string;
	showLoginButtons?: boolean;
};

const slides: SlideData[] = [
	{
		id: "1",
		type: "logo",
		showLoginButtons: false,
	},
	{
		id: "2",
		type: "image",
		imageUri:
			"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
		showLoginButtons: true,
	},
	{
		id: "3",
		type: "image",
		imageUri:
			"https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400",
		showLoginButtons: true,
	},
];

export default function GetStarted() {
	const insets = useSafeAreaInsets();
	const [currentIndex, setCurrentIndex] = useState(0);
	const flatListRef = useRef<FlatList>(null);

	const onViewableItemsChanged = useRef(
		({ viewableItems }: { viewableItems: ViewToken[] }) => {
			if (viewableItems.length > 0 && viewableItems[0].index !== null) {
				setCurrentIndex(viewableItems[0].index);
			}
		},
	).current;

	const viewabilityConfig = useRef({
		viewAreaCoveragePercentThreshold: 50,
	}).current;

	const handleStartLearning = () => {
		// Navigate to second slide or login
		if (currentIndex === 0) {
			flatListRef.current?.scrollToIndex({ index: 1, animated: true });
		} else {
			router.push("/sign_in" as never);
		}
	};

	const handleLogin = () => {
		router.push("/sign_in" as never);
	};

	const handleSignUp = () => {
		router.push("/sign_up" as never);
	};

	const renderSlide = ({ item }: { item: SlideData }) => (
		<View style={{ width }} className="flex-1">
			{/* Top section with circle background */}
			<View className="h-[55%] items-center justify-center bg-surface">
				{item.type === "logo" ? (
					<View className="h-52 w-52 items-center justify-center overflow-hidden rounded-full bg-card shadow-lg">
						<Image
							source={logoImage}
							className="h-48 w-48"
							resizeMode="contain"
						/>
					</View>
				) : (
					<View className="h-52 w-52 items-center justify-center overflow-hidden rounded-full bg-card shadow-lg">
						<Image
							source={{ uri: item.imageUri }}
							className="h-full w-full"
							resizeMode="cover"
						/>
					</View>
				)}
			</View>

			{/* Bottom section with content */}
			<View className="flex-1 rounded-t-3xl bg-card px-6 pt-6">
				{/* Pagination dots */}
				<View className="mb-6 flex-row items-center justify-center gap-2">
					{slides.map((_, index) => (
						<View
							key={`dot-${slides[index].id}`}
							className={`h-2 w-2 rounded-full ${
								index === currentIndex ? "bg-success" : "bg-border"
							}`}
						/>
					))}
				</View>

				{/* Title */}
				<Animated.View entering={FadeInDown.delay(200)}>
					<Text className="text-center font-bold text-2xl text-foreground">
						Grow Your Knowledge
					</Text>
					<Text className="text-center font-bold text-2xl text-foreground">
						With Education Plus+
					</Text>
				</Animated.View>

				{/* Subtitle */}
				<Animated.Text
					entering={FadeInDown.delay(300)}
					className="mt-3 text-center text-muted-foreground"
				>
					Give Wings to Your Dream
				</Animated.Text>

				{/* Buttons */}
				<View className="mt-8">
					{!item.showLoginButtons ? (
						<Pressable
							onPress={handleStartLearning}
							className="items-center rounded-full bg-success py-4"
						>
							<Text className="font-semibold text-base text-white">
								Start Learning
							</Text>
						</Pressable>
					) : (
						<View className="gap-3">
							<Pressable
								onPress={handleLogin}
								className="items-center rounded-full bg-success py-4"
							>
								<Text className="font-semibold text-base text-white">
									Log In
								</Text>
							</Pressable>
							<Pressable
								onPress={handleSignUp}
								className="items-center rounded-full border-2 border-foreground bg-card py-4"
							>
								<Text className="font-semibold text-base text-foreground">
									Sign Up
								</Text>
							</Pressable>
						</View>
					)}
				</View>
			</View>
		</View>
	);

	return (
		<View className="flex-1 bg-card" style={{ paddingBottom: insets.bottom }}>
			<FlatList
				ref={flatListRef}
				data={slides}
				renderItem={renderSlide}
				keyExtractor={(item) => item.id}
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				onViewableItemsChanged={onViewableItemsChanged}
				viewabilityConfig={viewabilityConfig}
				bounces={false}
			/>
		</View>
	);
}
