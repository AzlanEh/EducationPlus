import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { cn } from "heroui-native";
import { Pressable, Text, View } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type TabItem = {
	name: string;
	icon: keyof typeof Ionicons.glyphMap;
	activeIcon: keyof typeof Ionicons.glyphMap;
	route: string;
	badge?: number;
};

type BottomNavigationProps = {
	currentRoute: string;
	onNavigate: (route: string) => void;
	className?: string;
	badges?: Record<string, number>;
};

const tabs: TabItem[] = [
	{ name: "Home", icon: "home-outline", activeIcon: "home", route: "home" },
	{
		name: "Performance",
		icon: "stats-chart-outline",
		activeIcon: "stats-chart",
		route: "performance",
	},
	{
		name: "My Batches",
		icon: "book-outline",
		activeIcon: "book",
		route: "batches",
	},
	{
		name: "Profile",
		icon: "person-outline",
		activeIcon: "person",
		route: "profile",
	},
];

function TabButton({
	tab,
	isActive,
	badge,
	onPress,
}: {
	tab: TabItem;
	isActive: boolean;
	badge?: number;
	onPress: () => void;
}) {
	const scale = useSharedValue(1);
	const iconScale = useSharedValue(1);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const animatedIconStyle = useAnimatedStyle(() => ({
		transform: [{ scale: iconScale.value }],
	}));

	const handlePress = () => {
		// Haptic feedback
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

		// Scale animation on press
		scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
		iconScale.value = withSpring(1.15, { damping: 10, stiffness: 300 });

		setTimeout(() => {
			scale.value = withSpring(1, { damping: 15, stiffness: 400 });
			iconScale.value = withSpring(1, { damping: 10, stiffness: 300 });
		}, 100);

		onPress();
	};

	return (
		<AnimatedPressable
			style={animatedStyle}
			onPress={handlePress}
			accessibilityRole="tab"
			accessibilityState={{ selected: isActive }}
			accessibilityLabel={`${tab.name} tab${badge ? `, ${badge} notifications` : ""}`}
			className="flex-1 items-center py-2"
		>
			<View className="relative">
				<Animated.View style={animatedIconStyle}>
					<Ionicons
						name={isActive ? tab.activeIcon : tab.icon}
						size={24}
						color={isActive ? "var(--primary)" : "var(--muted-foreground)"}
					/>
				</Animated.View>

				{/* Badge */}
				{badge !== undefined && badge > 0 && (
					<View className="-right-2 -top-1 absolute h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1">
						<Text className="font-bold text-[10px] text-white">
							{badge > 99 ? "99+" : badge}
						</Text>
					</View>
				)}
			</View>

			<Text
				className={cn(
					"mt-1 text-xs",
					isActive
						? "font-semibold text-primary"
						: "font-medium text-muted-foreground",
				)}
			>
				{tab.name}
			</Text>

			{/* Active Indicator */}
			{isActive && (
				<Animated.View className="-bottom-1 absolute h-1 w-6 rounded-full bg-primary" />
			)}
		</AnimatedPressable>
	);
}

export function BottomNavigation({
	currentRoute,
	onNavigate,
	className,
	badges = {},
}: BottomNavigationProps) {
	const insets = useSafeAreaInsets();

	return (
		<View
			style={{ paddingBottom: Math.max(insets.bottom, 8) }}
			className={cn(
				"flex-row items-center justify-around border-border border-t bg-card pt-2",
				className,
			)}
		>
			{tabs.map((tab) => (
				<TabButton
					key={tab.route}
					tab={tab}
					isActive={currentRoute === tab.route}
					badge={badges[tab.route]}
					onPress={() => onNavigate(tab.route)}
				/>
			))}
		</View>
	);
}
