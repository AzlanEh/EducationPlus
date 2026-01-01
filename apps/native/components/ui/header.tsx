import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { cn } from "heroui-native";
import { Pressable, Text, View } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import { Avatar } from "./avatar";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type HeaderProps = {
	userName?: string;
	userImage?: string;
	greeting?: string;
	notificationCount?: number;
	onNotificationPress?: () => void;
	onProfilePress?: () => void;
	showThemeToggle?: boolean;
	rightContent?: React.ReactNode;
	className?: string;
};

function getGreeting(): string {
	const hour = new Date().getHours();
	if (hour < 12) return "Good Morning";
	if (hour < 17) return "Good Afternoon";
	return "Good Evening";
}

export function Header({
	userName = "Student",
	userImage,
	greeting,
	notificationCount = 0,
	onNotificationPress,
	onProfilePress,
	rightContent,
	className,
}: HeaderProps) {
	const bellScale = useSharedValue(1);

	const animatedBellStyle = useAnimatedStyle(() => ({
		transform: [{ scale: bellScale.value }],
	}));

	const handleNotificationPress = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		bellScale.value = withSpring(0.8, { damping: 10, stiffness: 400 });
		setTimeout(() => {
			bellScale.value = withSpring(1.1, { damping: 10, stiffness: 400 });
			setTimeout(() => {
				bellScale.value = withSpring(1, { damping: 10, stiffness: 400 });
			}, 100);
		}, 100);
		onNotificationPress?.();
	};

	const displayGreeting = greeting || getGreeting();
	const firstName = userName.split(" ")[0];

	return (
		<View
			className={cn("flex-row items-center justify-between py-3", className)}
		>
			{/* Left side - User greeting */}
			<Pressable
				onPress={onProfilePress}
				className="flex-1 flex-row items-center"
				accessibilityRole="button"
				accessibilityLabel={`Profile for ${userName}`}
			>
				<Avatar
					source={userImage ? { uri: userImage } : undefined}
					name={userName}
					size="md"
				/>
				<View className="ml-3 flex-shrink">
					<Text className="text-muted-foreground text-sm">
						{displayGreeting},
					</Text>
					<Text className="font-bold text-foreground text-lg" numberOfLines={1}>
						{firstName}
					</Text>
				</View>
			</Pressable>

			{/* Right side - Actions */}
			<View className="flex-row items-center gap-2">
				{rightContent}

				{/* Notification Bell */}
				{onNotificationPress && (
					<AnimatedPressable
						style={animatedBellStyle}
						onPress={handleNotificationPress}
						className="relative rounded-full bg-secondary p-2.5"
						accessibilityRole="button"
						accessibilityLabel={`Notifications${notificationCount > 0 ? `, ${notificationCount} unread` : ""}`}
					>
						<Ionicons
							name={
								notificationCount > 0
									? "notifications"
									: "notifications-outline"
							}
							size={22}
							color="var(--foreground)"
						/>
						{notificationCount > 0 && (
							<View className="-right-0.5 -top-0.5 absolute h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1">
								<Text className="font-bold text-[10px] text-white">
									{notificationCount > 99 ? "99+" : notificationCount}
								</Text>
							</View>
						)}
					</AnimatedPressable>
				)}
			</View>
		</View>
	);
}

// Simple header variant with just title
type SimpleHeaderProps = {
	title: string;
	subtitle?: string;
	rightContent?: React.ReactNode;
	className?: string;
};

export function SimpleHeader({
	title,
	subtitle,
	rightContent,
	className,
}: SimpleHeaderProps) {
	return (
		<View
			className={cn("flex-row items-center justify-between py-3", className)}
		>
			<View>
				{subtitle && (
					<Text className="text-muted-foreground text-sm">{subtitle}</Text>
				)}
				<Text className="font-bold text-foreground text-lg">{title}</Text>
			</View>
			{rightContent && (
				<View className="flex-row items-center gap-2">{rightContent}</View>
			)}
		</View>
	);
}
