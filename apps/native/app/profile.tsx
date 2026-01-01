import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
	Pressable,
	RefreshControl,
	ScrollView,
	Switch,
	Text,
	View,
} from "react-native";
import Animated, {
	FadeInDown,
	FadeInRight,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Avatar, Button, Card, useToast } from "@/components/ui";
import { useAppTheme } from "@/contexts/app-theme-context";
import { useUser } from "@/hooks/useUser";

type StatItemProps = {
	icon: keyof typeof Ionicons.glyphMap;
	value: number;
	label: string;
	color: string;
	showBorder?: boolean;
	index: number;
};

type MenuItemProps = {
	icon: keyof typeof Ionicons.glyphMap;
	label: string;
	onPress: () => void;
	rightElement?: React.ReactNode;
	showArrow?: boolean;
	iconBgColor?: string;
	index: number;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function StatItem({
	icon,
	value,
	label,
	color,
	showBorder = true,
	index,
}: StatItemProps) {
	return (
		<Animated.View
			entering={FadeInDown.delay(100 + index * 50)
				.springify()
				.damping(15)}
			className={`flex-1 items-center py-4 ${showBorder ? "border-border/30 border-r" : ""}`}
		>
			<View
				className="mb-2 h-10 w-10 items-center justify-center rounded-full"
				style={{ backgroundColor: `${color}20` }}
			>
				<Ionicons name={icon} size={20} color={color} />
			</View>
			<Text className="font-bold text-foreground text-lg">{value}</Text>
			<Text className="text-muted-foreground text-xs">{label}</Text>
		</Animated.View>
	);
}

function MenuItem({
	icon,
	label,
	onPress,
	rightElement,
	showArrow = true,
	iconBgColor = "bg-primary/10",
	index,
}: MenuItemProps) {
	const scale = useSharedValue(1);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const handlePressIn = () => {
		scale.value = withSpring(0.98, { damping: 15 });
	};

	const handlePressOut = () => {
		scale.value = withSpring(1, { damping: 15 });
	};

	const handlePress = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		onPress();
	};

	return (
		<AnimatedPressable
			onPress={handlePress}
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
			style={animatedStyle}
		>
			<Animated.View
				entering={FadeInRight.delay(200 + index * 50)
					.springify()
					.damping(15)}
				className="flex-row items-center rounded-xl bg-card px-4 py-3.5"
			>
				<View
					className={`mr-3 h-10 w-10 items-center justify-center rounded-xl ${iconBgColor}`}
				>
					<Ionicons name={icon} size={20} color="var(--primary)" />
				</View>
				<Text className="flex-1 font-medium text-base text-foreground">
					{label}
				</Text>
				{rightElement}
				{showArrow && !rightElement && (
					<Ionicons name="chevron-forward" size={20} color="var(--muted)" />
				)}
			</Animated.View>
		</AnimatedPressable>
	);
}

function HeaderBackground({ isDark }: { isDark: boolean }) {
	return (
		<Svg
			width="100%"
			height="100%"
			preserveAspectRatio="none"
			viewBox="0 0 400 200"
		>
			<Defs>
				<LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
					<Stop offset="0%" stopColor={isDark ? "#1a3a2f" : "#7cb342"} />
					<Stop offset="50%" stopColor={isDark ? "#22543d" : "#9ccc65"} />
					<Stop offset="100%" stopColor={isDark ? "#2d5a4a" : "#c5e1a5"} />
				</LinearGradient>
			</Defs>
			<Rect x="0" y="0" width="400" height="200" fill="url(#grad)" />
			{/* Decorative wave curves */}
			<Path
				d="M250,20 Q350,60 420,40 L420,120 Q350,100 250,140 Q150,180 100,140 L100,80 Q150,60 250,20"
				fill="rgba(255,255,255,0.1)"
			/>
			<Path
				d="M280,40 Q380,80 450,60 L450,140 Q380,120 280,160 Q180,200 130,160 L130,100 Q180,80 280,40"
				fill="rgba(255,255,255,0.05)"
			/>
		</Svg>
	);
}

export default function Profile() {
	const { user } = useUser();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { isDark, toggleTheme } = useAppTheme();
	const { showToast } = useToast();
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [notificationsEnabled, setNotificationsEnabled] = useState(true);

	const handleNavigate = (route: string) => {
		if (route === "home") {
			router.push("/home");
		} else if (route === "batches") {
			router.push("/my-batches");
		} else if (route === "profile") {
			// Already on profile
		}
	};

	const handleRefresh = useCallback(async () => {
		setIsRefreshing(true);
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		// Simulate refresh
		await new Promise((resolve) => setTimeout(resolve, 1500));
		setIsRefreshing(false);
		showToast({
			type: "success",
			title: "Profile updated",
			message: "Your profile data has been refreshed",
		});
	}, [showToast]);

	const handleEditProfile = () => {
		router.push("/profile-edit");
	};

	const handleNotifications = () => {
		router.push("/notifications");
	};

	const handleHelp = () => {
		showToast({
			type: "info",
			title: "Help Center",
			message: "Help center coming soon!",
		});
	};

	const handlePrivacy = () => {
		showToast({
			type: "info",
			title: "Privacy Policy",
			message: "Privacy policy coming soon!",
		});
	};

	const handleAbout = () => {
		showToast({
			type: "info",
			title: "About EduPlus",
			message: "Version 1.0.0",
		});
	};

	const handleLogout = () => {
		Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
		showToast({
			type: "warning",
			title: "Logout",
			message: "Are you sure you want to logout?",
			action: {
				label: "Confirm",
				onPress: () => {
					showToast({
						type: "success",
						title: "Logged out",
						message: "You have been logged out successfully",
					});
					router.replace("/sign_in");
				},
			},
		});
	};

	const handleToggleNotifications = (value: boolean) => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		setNotificationsEnabled(value);
		showToast({
			type: value ? "success" : "info",
			title: value ? "Notifications enabled" : "Notifications disabled",
		});
	};

	const handleToggleTheme = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		toggleTheme();
		showToast({
			type: "success",
			title: `${isDark ? "Light" : "Dark"} mode enabled`,
		});
	};

	return (
		<View className="flex-1 bg-background">
			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={isRefreshing}
						onRefresh={handleRefresh}
						tintColor="var(--primary)"
					/>
				}
			>
				{/* Header with gradient background */}
				<View className="relative h-52">
					<View className="absolute inset-0">
						<HeaderBackground isDark={isDark} />
					</View>

					{/* Navigation buttons */}
					<View
						className="absolute right-4 left-4 flex-row justify-between"
						style={{ paddingTop: insets.top + 8 }}
					>
						<Pressable
							onPress={() => {
								Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
								router.back();
							}}
							className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
						>
							<Ionicons name="arrow-back" size={20} color="#ffffff" />
						</Pressable>
						<View className="flex-row gap-2">
							<Pressable
								onPress={handleNotifications}
								className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
							>
								<Ionicons
									name="notifications-outline"
									size={20}
									color="#ffffff"
								/>
							</Pressable>
							<Pressable
								onPress={handleEditProfile}
								className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
							>
								<Ionicons name="create-outline" size={20} color="#ffffff" />
							</Pressable>
						</View>
					</View>
				</View>

				{/* Profile content */}
				<View className="-mt-20 flex-1 px-5 pb-24">
					{/* Avatar section */}
					<Animated.View
						entering={FadeInDown.springify().damping(15)}
						className="mb-4 items-center"
					>
						<View className="relative">
							<Avatar
								source={{ uri: user.avatar }}
								name={user.name}
								size="xl"
							/>
							<View className="absolute right-0 bottom-0 h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-success">
								<Ionicons name="checkmark" size={14} color="#fff" />
							</View>
						</View>
					</Animated.View>

					{/* User info */}
					<Animated.View
						entering={FadeInDown.delay(50).springify().damping(15)}
						className="mb-1 items-center"
					>
						<Text className="font-bold text-foreground text-xl">
							{user.name}
						</Text>
						<View className="mt-1 flex-row items-center">
							<Ionicons name="mail-outline" size={14} color="var(--muted)" />
							<Text className="ml-1 text-muted-foreground text-sm">
								{user.email || "No email added"}
							</Text>
						</View>
						{user.location && (
							<View className="mt-0.5 flex-row items-center">
								<Ionicons
									name="location-outline"
									size={14}
									color="var(--muted)"
								/>
								<Text className="ml-1 text-muted-foreground text-sm">
									{user.location}
								</Text>
							</View>
						)}
					</Animated.View>

					{/* Stats card */}
					<Animated.View
						entering={FadeInDown.delay(100).springify().damping(15)}
						className="mt-5"
					>
						<Card className="overflow-hidden rounded-2xl">
							<View className="flex-row">
								<StatItem
									icon="ribbon"
									value={user.rank || 0}
									label="Rank"
									color="#22c55e"
									index={0}
								/>
								<StatItem
									icon="book"
									value={user.documents || 0}
									label="Courses"
									color="#3b82f6"
									index={1}
								/>
								<StatItem
									icon="trophy"
									value={user.downloads || 0}
									label="Badges"
									color="#f59e0b"
									showBorder={false}
									index={2}
								/>
							</View>
						</Card>
					</Animated.View>

					{/* Settings Section */}
					<Text className="mt-6 mb-3 font-semibold text-muted-foreground text-xs tracking-wider">
						ACCOUNT SETTINGS
					</Text>
					<View className="gap-2">
						<MenuItem
							icon="person-outline"
							label="Edit Profile"
							onPress={handleEditProfile}
							index={0}
						/>
						<MenuItem
							icon="notifications-outline"
							label="Notifications"
							onPress={handleNotifications}
							rightElement={
								<Switch
									value={notificationsEnabled}
									onValueChange={handleToggleNotifications}
									trackColor={{ false: "#767577", true: "#22c55e" }}
									thumbColor="#ffffff"
								/>
							}
							showArrow={false}
							index={1}
						/>
						<MenuItem
							icon={isDark ? "sunny-outline" : "moon-outline"}
							label={isDark ? "Light Mode" : "Dark Mode"}
							onPress={handleToggleTheme}
							rightElement={
								<Switch
									value={isDark}
									onValueChange={handleToggleTheme}
									trackColor={{ false: "#767577", true: "#22c55e" }}
									thumbColor="#ffffff"
								/>
							}
							showArrow={false}
							index={2}
						/>
					</View>

					{/* Support Section */}
					<Text className="mt-6 mb-3 font-semibold text-muted-foreground text-xs tracking-wider">
						SUPPORT
					</Text>
					<View className="gap-2">
						<MenuItem
							icon="help-circle-outline"
							label="Help Center"
							onPress={handleHelp}
							index={3}
						/>
						<MenuItem
							icon="shield-checkmark-outline"
							label="Privacy Policy"
							onPress={handlePrivacy}
							index={4}
						/>
						<MenuItem
							icon="information-circle-outline"
							label="About"
							onPress={handleAbout}
							index={5}
						/>
					</View>

					{/* Logout Button */}
					<Animated.View
						entering={FadeInDown.delay(400).springify().damping(15)}
						className="mt-8"
					>
						<Button
							variant="destructive"
							size="lg"
							onPress={handleLogout}
							className="rounded-xl"
						>
							<View className="flex-row items-center justify-center gap-2">
								<Ionicons name="log-out-outline" size={20} color="#ffffff" />
								<Text className="font-semibold text-white">Log Out</Text>
							</View>
						</Button>
					</Animated.View>

					{/* App Version */}
					<Text className="mt-6 text-center text-muted-foreground text-xs">
						EduPlus v1.0.0
					</Text>
				</View>
			</ScrollView>

			{/* Bottom Navigation */}
			<View
				className="absolute right-0 bottom-0 left-0 bg-background"
				style={{ paddingBottom: insets.bottom }}
			>
				<BottomNavigation currentRoute="profile" onNavigate={handleNavigate} />
			</View>
		</View>
	);
}
