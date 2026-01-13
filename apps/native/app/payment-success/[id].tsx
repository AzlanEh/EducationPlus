import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown, ZoomIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";

// Success Badge Component
function SuccessBadge() {
	return (
		<Svg width={120} height={120} viewBox="0 0 120 120">
			{/* Starburst background */}
			<Path
				d="M60 0L67.5 25.5L90 10L82.5 37.5L110 30L92.5 52.5L120 60L92.5 67.5L110 90L82.5 82.5L90 110L67.5 94.5L60 120L52.5 94.5L30 110L37.5 82.5L10 90L27.5 67.5L0 60L27.5 52.5L10 30L37.5 37.5L30 10L52.5 25.5L60 0Z"
				fill="#86efac"
			/>
			{/* Inner circle - using success color */}
			<Circle cx="60" cy="60" r="35" fill="#22c55e" />
			{/* Checkmark */}
			<Path
				d="M45 60L55 70L75 50"
				stroke="white"
				strokeWidth="5"
				strokeLinecap="round"
				strokeLinejoin="round"
				fill="none"
			/>
		</Svg>
	);
}

export default function PaymentSuccess() {
	const insets = useSafeAreaInsets();
	const { id } = useLocalSearchParams<{ id: string }>();

	void id; // Reserved for fetching batch details

	const handleGoBatch = () => {
		router.replace({
			pathname: "/batch/[id]" as never,
			params: { id: id || "1" },
		});
	};

	return (
		<View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
			{/* Main Content Card */}
			<View className="m-4 flex-1 rounded-3xl bg-card p-4">
				{/* Back Button */}
				<Pressable
					onPress={() => router.back()}
					className="mb-4 flex-row items-center"
				>
					<Ionicons name="chevron-back" size={24} color="var(--foreground)" />
					<Text className="ml-1 font-medium text-foreground text-lg">Back</Text>
				</Pressable>

				{/* Success Content - Centered */}
				<View className="flex-1 items-center justify-center">
					{/* Success Badge */}
					<Animated.View entering={ZoomIn.delay(200).springify()}>
						<SuccessBadge />
					</Animated.View>

					{/* Thank You Text */}
					<Animated.Text
						entering={FadeInDown.delay(400)}
						className="mt-8 font-bold text-3xl text-foreground"
					>
						Thank You !
					</Animated.Text>

					{/* Subtitle */}
					<Animated.View entering={FadeIn.delay(600)} className="mt-4">
						<Text className="text-center text-base text-muted-foreground">
							Start Your Preparation Right Now
						</Text>
						<Text className="mt-1 text-center font-medium text-base text-foreground">
							Md Meraz Nadim
						</Text>
					</Animated.View>
				</View>
			</View>

			{/* Go Batch Button */}
			<View
				className="bg-surface px-4 py-3"
				style={{ paddingBottom: insets.bottom + 12 }}
			>
				<Pressable
					onPress={handleGoBatch}
					className="items-center rounded-full bg-success py-4"
				>
					<Text className="font-semibold text-lg text-white">Go Batch</Text>
				</Pressable>
			</View>
		</View>
	);
}
