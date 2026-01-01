import { router } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Text as SvgText } from "react-native-svg";

// Education Plus+ Logo Component
function EducationPlusLogo({ size = 180 }: { size?: number }) {
	return (
		<Svg width={size} height={size} viewBox="0 0 180 180">
			{/* Outer white circle */}
			<Circle cx="90" cy="90" r="88" fill="#ffffff" />
			{/* Inner black circle */}
			<Circle
				cx="90"
				cy="90"
				r="70"
				fill="#1a1a1a"
				stroke="#1a1a1a"
				strokeWidth="3"
			/>
			{/* Inner border ring */}
			<Circle
				cx="90"
				cy="90"
				r="62"
				fill="none"
				stroke="#ffffff"
				strokeWidth="1"
				opacity="0.3"
			/>
			{/* E logo at top */}
			<Circle
				cx="90"
				cy="45"
				r="12"
				fill="#1a1a1a"
				stroke="#ffffff"
				strokeWidth="1"
			/>
			<SvgText
				x="90"
				y="50"
				fontSize="14"
				fontWeight="bold"
				fill="#ffffff"
				textAnchor="middle"
				fontFamily="serif"
			>
				E
			</SvgText>
			{/* Education text */}
			<SvgText
				x="90"
				y="85"
				fontSize="18"
				fill="#ffffff"
				textAnchor="middle"
				fontFamily="system-ui"
			>
				Education
			</SvgText>
			{/* Plus+ text */}
			<SvgText
				x="90"
				y="115"
				fontSize="26"
				fontWeight="bold"
				fill="#ffffff"
				textAnchor="middle"
				fontFamily="system-ui"
			>
				Plus+
			</SvgText>
		</Svg>
	);
}

export default function SplashScreen() {
	const scale = useSharedValue(0.3);
	const opacity = useSharedValue(0);

	useEffect(() => {
		// Animate logo appearance
		scale.value = withSpring(1, { damping: 12, stiffness: 100 });
		opacity.value = withTiming(1, { duration: 500 });

		// Navigate to get-started after animation
		const timer = setTimeout(() => {
			router.replace("/get-started" as never);
		}, 2500);

		return () => clearTimeout(timer);
	}, [opacity, scale]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
		opacity: opacity.value,
	}));

	return (
		<View className="flex-1 items-center justify-center bg-[#e8ebe8]">
			<Animated.View style={animatedStyle}>
				<View className="h-48 w-48 items-center justify-center rounded-full bg-white shadow-lg">
					<EducationPlusLogo size={180} />
				</View>
			</Animated.View>
		</View>
	);
}

export { EducationPlusLogo };
