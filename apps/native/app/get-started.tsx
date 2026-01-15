import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
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
			"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
		showLoginButtons: true,
	},
	{
		id: "3",
		type: "image",
		imageUri:
			"https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800",
		showLoginButtons: true,
	},
];

export default function GetStarted() {
	const insets = useSafeAreaInsets();
	const [currentIndex, setCurrentIndex] = useState(0);
	const flatListRef = useRef<FlatList>(null);
	const autoAdvancedRef = useRef(false);

	/* ----------------------------------
	   Auto-advance FIRST slide only
	---------------------------------- */
	useEffect(() => {
		if (currentIndex === 0 && !autoAdvancedRef.current) {
			autoAdvancedRef.current = true;
			const timer = setTimeout(() => {
				flatListRef.current?.scrollToIndex({
					index: 1,
					animated: true,
				});
			}, 1600); // deliberate, feels premium

			return () => clearTimeout(timer);
		}
	}, [currentIndex]);

	const onViewableItemsChanged = useRef(
		({ viewableItems }: { viewableItems: ViewToken[] }) => {
			if (viewableItems[0]?.index != null) {
				setCurrentIndex(viewableItems[0].index);
			}
		},
	).current;

	const viewabilityConfig = useRef({
		viewAreaCoveragePercentThreshold: 60,
	}).current;

	const renderSlide = ({ item }: { item: SlideData }) => (
		<View style={{ width }} className="flex-1 bg-background">
			{/* HERO */}
			<View className="h-[56%] items-center justify-center">
				<View className="h-56 w-56 items-center justify-center rounded-full bg-card shadow-lg">
					<Image
						source={item.type === "logo" ? logoImage : { uri: item.imageUri }}
						className="h-[85%] w-[85%]"
						resizeMode={item.type === "logo" ? "contain" : "cover"}
					/>
				</View>
			</View>

			{/* CONTENT */}
			<View className="flex-1 rounded-t-3xl bg-card px-6 pt-6">
				{/* Pagination */}
				<View className="mb-6 flex-row justify-center gap-2">
					{slides.map((_, index) => (
						<View
							key={index}
							className={`h-2.5 rounded-full ${
								index === currentIndex ? "w-6 bg-success" : "w-2.5 bg-border"
							}`}
						/>
					))}
				</View>

				{/* Headline – FIXED contrast */}
				<Animated.View entering={FadeInDown.delay(150)}>
					<Text className="text-center font-bold text-3xl text-card-foreground">
						Grow Your Knowledge
					</Text>
					<Text className="mt-1 text-center font-bold text-3xl text-card-foreground">
						with Education Plus+
					</Text>
				</Animated.View>

				{/* Subtitle */}
				<Animated.Text
					entering={FadeInDown.delay(250)}
					className="mt-4 text-center text-base text-muted-foreground"
				>
					Give wings to your dreams through structured learning
				</Animated.Text>

				{/* Actions */}
				<View className="mt-10 gap-4">
					{!item.showLoginButtons ? (
						<Pressable
							onPress={() =>
								flatListRef.current?.scrollToIndex({
									index: 1,
									animated: true,
								})
							}
							className="rounded-full bg-primary py-4 shadow-md active:opacity-90"
						>
							<Text className="text-center font-semibold text-base text-primary-foreground">
								Start Learning
							</Text>
						</Pressable>
					) : (
						<>
							<Pressable
								onPress={() => router.push("/sign_in" as never)}
								className="rounded-full bg-primary py-4 shadow-md active:opacity-90"
							>
								<Text className="text-center font-semibold text-base text-primary-foreground">
									Log In
								</Text>
							</Pressable>

							<Pressable
								onPress={() => router.push("/sign_up" as never)}
								className="rounded-full border border-border bg-card py-4 active:bg-muted"
							>
								<Text className="text-center font-semibold text-base text-card-foreground">
									Sign Up
								</Text>
							</Pressable>
						</>
					)}
				</View>
			</View>
		</View>
	);

	return (
		<View
			className="flex-1 bg-background"
			style={{ paddingBottom: insets.bottom }}
		>
			<FlatList
				ref={flatListRef}
				data={slides}
				renderItem={renderSlide}
				keyExtractor={(item) => item.id}
				horizontal
				pagingEnabled
				bounces={false}
				showsHorizontalScrollIndicator={false}
				onViewableItemsChanged={onViewableItemsChanged}
				viewabilityConfig={viewabilityConfig}
			/>
		</View>
	);
}
