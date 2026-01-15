import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { cn } from "heroui-native";
import { useState } from "react";
import {
	Image,
	type ImageSourcePropType,
	Pressable,
	Text,
	View,
} from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type BatchCardProps = {
	banner: ImageSourcePropType;
	title: string;
	subtitle?: string;
	instructor?: string;
	startDate?: string;
	endDate?: string;
	price: number;
	originalPrice?: number;
	isNew?: boolean;
	isPopular?: boolean;
	rating?: number;
	reviewCount?: number;
	enrolledCount?: number;
	showRefundPolicy?: boolean;
	isBookmarked?: boolean;
	onBookmarkPress?: () => void;
	onExplore?: () => void;
	onBuyNow?: () => void;
	onPress?: () => void;
	className?: string;
};

export function BatchCard({
	banner,
	title,
	subtitle,
	instructor,
	startDate,
	endDate,
	price,
	originalPrice,
	isNew = false,
	isPopular = false,
	rating,
	reviewCount,
	enrolledCount,
	showRefundPolicy = false,
	isBookmarked = false,
	onBookmarkPress,
	onExplore,
	onBuyNow,
	onPress,
	className,
}: BatchCardProps) {
	const [bookmarked, setBookmarked] = useState(isBookmarked);
	const scale = useSharedValue(1);
	const bookmarkScale = useSharedValue(1);

	const animatedCardStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const animatedBookmarkStyle = useAnimatedStyle(() => ({
		transform: [{ scale: bookmarkScale.value }],
	}));

	const handlePressIn = () => {
		if (onPress) {
			scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
		}
	};

	const handlePressOut = () => {
		scale.value = withSpring(1, { damping: 15, stiffness: 400 });
	};

	const handleBookmark = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		bookmarkScale.value = withSpring(0.8, { damping: 10, stiffness: 400 });
		setTimeout(() => {
			bookmarkScale.value = withSpring(1.2, { damping: 10, stiffness: 400 });
			setTimeout(() => {
				bookmarkScale.value = withSpring(1, { damping: 10, stiffness: 400 });
			}, 100);
		}, 100);
		setBookmarked(!bookmarked);
		onBookmarkPress?.();
	};

	const handleButtonPress = (callback?: () => void) => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		callback?.();
	};

	// Calculate discount percentage
	const discountPercent =
		originalPrice && originalPrice > price
			? Math.round(((originalPrice - price) / originalPrice) * 100)
			: null;

	const CardWrapper = onPress ? AnimatedPressable : Animated.View;

	return (
		<CardWrapper
			style={animatedCardStyle}
			onPressIn={onPress ? handlePressIn : undefined}
			onPressOut={onPress ? handlePressOut : undefined}
			onPress={onPress}
			accessibilityRole={onPress ? "button" : undefined}
			accessibilityLabel={`${title} batch, price ${price} rupees${isNew ? ", new" : ""}`}
			className={cn(
				"mb-4 overflow-hidden rounded-2xl bg-card shadow-md",
				className,
			)}
		>
			{/* Title Header - Above Banner */}
			<View className="flex-row items-center justify-between bg-card px-4 py-3">
				<View className="flex-1 flex-row items-center gap-2">
					<Text
						className="flex-shrink font-semibold text-base text-foreground"
						numberOfLines={1}
					>
						{title}
					</Text>
					{isNew && (
						<View className="rounded-md bg-success px-2 py-0.5">
							<Text className="font-semibold text-white text-xs">New</Text>
						</View>
					)}
					{isPopular && !isNew && (
						<View className="rounded-md bg-accent-orange px-2 py-0.5">
							<Text className="font-semibold text-white text-xs">Popular</Text>
						</View>
					)}
				</View>

				{/* Bookmark Button */}
				<AnimatedPressable
					style={animatedBookmarkStyle}
					onPress={handleBookmark}
					hitSlop={12}
					accessibilityRole="button"
					accessibilityLabel={
						bookmarked ? "Remove from bookmarks" : "Add to bookmarks"
					}
					className="ml-2 p-1"
				>
					<Ionicons
						name={bookmarked ? "bookmark" : "bookmark-outline"}
						size={22}
						color={bookmarked ? "var(--accent)" : "var(--muted-foreground)"}
					/>
				</AnimatedPressable>
			</View>

			{/* Banner Image */}
			<View className="relative">
				<Image
					source={banner}
					style={{ width: "100%", height: 160 }}
					resizeMode="cover"
					accessibilityIgnoresInvertColors
				/>

				{/* Discount Badge */}
				{discountPercent && discountPercent > 0 && (
					<View className="absolute top-3 right-3 rounded-lg bg-danger px-2 py-1">
						<Text className="font-bold text-white text-xs">
							{discountPercent}% OFF
						</Text>
					</View>
				)}

				{/* Enrolled Count Overlay */}
				{enrolledCount && enrolledCount > 0 && (
					<View className="absolute bottom-3 left-3 flex-row items-center rounded-full bg-black/60 px-2.5 py-1">
						<Ionicons
							name="people"
							size={14}
							color="var(--primary-foreground)"
						/>
						<Text className="ml-1.5 font-medium text-white text-xs">
							{enrolledCount.toLocaleString()}+ enrolled
						</Text>
					</View>
				)}
			</View>

			{/* Content */}
			<View className="p-4">
				{/* Rating & Reviews */}
				{rating !== undefined && (
					<View className="mb-2 flex-row items-center">
						<View className="flex-row items-center rounded-md bg-success/15 px-2 py-0.5">
							<Ionicons name="star" size={12} color="var(--primary)" />
							<Text className="ml-1 font-semibold text-success text-xs">
								{rating.toFixed(1)}
							</Text>
						</View>
						{reviewCount !== undefined && (
							<Text className="ml-2 text-muted-foreground text-xs">
								({reviewCount.toLocaleString()} reviews)
							</Text>
						)}
					</View>
				)}

				{/* Instructor & Class Info */}
				{(instructor || subtitle) && (
					<View className="mb-2 flex-row items-center">
						<Ionicons
							name="school-outline"
							size={14}
							color="var(--muted-foreground)"
						/>
						<Text className="ml-1.5 text-muted-foreground text-xs">
							{instructor || subtitle}
						</Text>
					</View>
				)}

				{/* Date Info */}
				{(startDate || endDate) && (
					<View className="mb-3 flex-row items-center">
						<Ionicons
							name="calendar-outline"
							size={14}
							color="var(--muted-foreground)"
						/>
						<Text className="ml-1.5 text-muted-foreground text-xs">
							{startDate && `Starts ${startDate}`}
							{startDate && endDate && " - "}
							{endDate && `Ends ${endDate}`}
						</Text>
					</View>
				)}

				{/* Price and Actions */}
				<View className="flex-row items-center justify-between">
					<View>
						<View className="flex-row items-center">
							<Text className="font-bold text-foreground text-lg">
								₹{price.toLocaleString()}
							</Text>
							{originalPrice && originalPrice > price && (
								<Text className="ml-2 text-muted-foreground text-sm line-through">
									₹{originalPrice.toLocaleString()}
								</Text>
							)}
						</View>
						{showRefundPolicy ? (
							<Text className="text-muted-foreground text-xs">(No Refund)</Text>
						) : (
							<Text className="text-success text-xs">7-day refund policy</Text>
						)}
					</View>

					<View className="flex-row gap-2">
						{onExplore && (
							<Pressable
								onPress={() => handleButtonPress(onExplore)}
								accessibilityRole="button"
								accessibilityLabel={`Explore ${title}`}
								className="rounded-lg border border-accent px-4 py-2 active:bg-accent/10"
							>
								<Text className="font-semibold text-accent text-sm">
									EXPLORE
								</Text>
							</Pressable>
						)}
						{onBuyNow && (
							<Pressable
								onPress={() => handleButtonPress(onBuyNow)}
								accessibilityRole="button"
								accessibilityLabel={`Buy ${title} for ${price} rupees`}
								className="rounded-lg bg-success px-4 py-2 active:bg-success/80"
							>
								<Text className="font-semibold text-sm text-white">
									BUY NOW
								</Text>
							</Pressable>
						)}
					</View>
				</View>
			</View>
		</CardWrapper>
	);
}

// Keep default export for backward compatibility
export default BatchCard;
