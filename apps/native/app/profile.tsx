import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
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
import { Avatar, Button, Card, Skeleton, useToast } from "@/components/ui";
import { useAppTheme } from "@/contexts/app-theme-context";
import { authClient } from "@/lib/auth-client";
import { client, queryClient } from "@/utils/orpc";

type StatItemProps = {
	icon: keyof typeof Ionicons.glyphMap;
	value: number | string;
	label: string;
	color: string;
	showBorder?: boolean;
	index: number;
	isLoading?: boolean;
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
	isLoading,
}: StatItemProps) {
	return (
		<View
			className={`flex-1 items-center py-4 ${showBorder ? "border-border/30 border-r" : ""}`}
		>
			<View
				className="mb-2 h-10 w-10 items-center justify-center rounded-full"
				style={{ backgroundColor: `${color}20` }}
			>
				<Ionicons name={icon} size={20} color={color} />
			</View>
			{isLoading ? (
				<Skeleton className="mb-1 h-6 w-8" />
			) : (
				<Text className="font-bold text-foreground text-lg">{value}</Text>
			)}
			<Text className="text-muted-foreground text-xs">{label}</Text>
		</View>
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
			<View className="flex-row items-center rounded-xl bg-card px-4 py-3.5">
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
			</View>
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
					<Stop offset="0%" stopColor="var(--primary)" />
					<Stop offset="100%" stopColor="var(--accent)" />
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
	const { data: sessionData } = authClient.useSession();
	const user = sessionData?.user;
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { isDark, toggleTheme } = useAppTheme();
	const { showToast } = useToast();
	const [notificationsEnabled, setNotificationsEnabled] = useState(true);

	// Fetch user stats from API
	const {
		data: statsData,
		isLoading: statsLoading,
		refetch: refetchStats,
		isRefetching,
	} = useQuery({
		queryKey: ["user-stats"],
		queryFn: () => (client as any).v1.student.getUserStats(),
		enabled: !!user,
	});

	const stats = statsData || {
		enrolledCourses: 0,
		completedCourses: 0,
		completedVideos: 0,
		dppAttempts: 0,
		avgDPPScore: 0,
		currentStreak: 0,
		longestStreak: 0,
		totalStudyDays: 0,
	};

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
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		await refetchStats();
		showToast({
			type: "success",
			title: "Profile updated",
			message: "Your profile data has been refreshed",
		});
	}, [refetchStats, showToast]);

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
				onPress: async () => {
					await authClient.signOut();
					queryClient.clear();
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

	// If not logged in, show login prompt
	if (!user) {
		return (
			<View className="flex-1 bg-background">
				<View
					className="flex-1 items-center justify-center px-6"
					style={{ paddingTop: insets.top }}
				>
					<Ionicons
						name="person-circle-outline"
						size={80}
						color="var(--muted)"
					/>
					<Text className="mt-4 text-center font-bold text-foreground text-xl">
						Sign in to view your profile
					</Text>
					<Text className="mt-2 text-center text-muted-foreground">
						Track your progress, manage courses, and more
					</Text>
					<Button
						onPress={() => router.push("/sign_in")}
						className="mt-6 w-full"
					>
						<Text className="font-semibold text-white">Sign In</Text>
					</Button>
				</View>
				<View
					className="bg-background"
					style={{ paddingBottom: insets.bottom }}
				>
					<BottomNavigation
						currentRoute="profile"
						onNavigate={handleNavigate}
					/>
				</View>
			</View>
		);
	}

	return (
		<View className="flex-1 bg-background">
			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={isRefetching}
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
							<Ionicons
								name="arrow-back"
								size={20}
								color="var(--primary-foreground)"
							/>
						</Pressable>
						<View className="flex-row gap-2">
							<Pressable
								onPress={handleNotifications}
								className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
							>
								<Ionicons
									name="notifications-outline"
									size={20}
									color="var(--primary-foreground)"
								/>
							</Pressable>
							<Pressable
								onPress={handleEditProfile}
								className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
							>
								<Ionicons
									name="create-outline"
									size={20}
									color="var(--primary-foreground)"
								/>
							</Pressable>
						</View>
					</View>
				</View>

				{/* Profile content */}
				<View className="-mt-20 flex-1 px-5 pb-24">
					{/* Avatar section */}
					<View className="mb-4 items-center">
						<View className="relative">
							<Avatar
								source={user.image ? { uri: user.image } : undefined}
								name={user.name || "User"}
								size="xl"
							/>
							<View className="absolute right-0 bottom-0 h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-success">
								<Ionicons
									name="checkmark"
									size={14}
									color="var(--primary-foreground)"
								/>
							</View>
						</View>
					</View>

					{/* User info */}
					<View className="mb-1 items-center">
						<Text className="font-bold text-foreground text-xl">
							{user.name || "Student"}
						</Text>
						<View className="mt-1 flex-row items-center">
							<Ionicons name="mail-outline" size={14} color="var(--muted)" />
							<Text className="ml-1 text-muted-foreground text-sm">
								{user.email || "No email added"}
							</Text>
						</View>
						{stats.currentStreak > 0 && (
							<View className="mt-2 flex-row items-center rounded-full bg-warning/10 px-3 py-1">
								<Ionicons name="flame" size={16} color="var(--chart-4)" />
								<Text className="ml-1 font-medium text-sm text-warning">
									{stats.currentStreak} day streak!
								</Text>
							</View>
						)}
					</View>

					{/* Stats card */}
					<View className="mt-5">
						<Card className="overflow-hidden rounded-2xl">
							<View className="flex-row">
								<StatItem
									icon="book"
									value={stats.enrolledCourses}
									label="Courses"
									color="var(--chart-2)"
									index={0}
									isLoading={statsLoading}
								/>
								<StatItem
									icon="videocam"
									value={stats.completedVideos}
									label="Videos"
									color="var(--chart-1)"
									index={1}
									isLoading={statsLoading}
								/>
								<StatItem
									icon="document-text"
									value={stats.dppAttempts}
									label="DPPs"
									color="var(--chart-4)"
									showBorder={false}
									index={2}
									isLoading={statsLoading}
								/>
							</View>
						</Card>
					</View>

					{/* Performance card */}
					<View className="mt-4">
						<Card className="overflow-hidden rounded-2xl">
							<View className="flex-row">
								<StatItem
									icon="trending-up"
									value={`${stats.avgDPPScore.toFixed(0)}%`}
									label="Avg Score"
									color="var(--chart-3)"
									index={3}
									isLoading={statsLoading}
								/>
								<StatItem
									icon="flame"
									value={stats.currentStreak}
									label="Streak"
									color="var(--destructive)"
									index={4}
									isLoading={statsLoading}
								/>
								<StatItem
									icon="calendar"
									value={stats.totalStudyDays}
									label="Study Days"
									color="var(--chart-5)"
									showBorder={false}
									index={5}
									isLoading={statsLoading}
								/>
							</View>
						</Card>
					</View>

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
									trackColor={{ false: "var(--muted)", true: "var(--primary)" }}
									thumbColor="var(--primary-foreground)"
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
									trackColor={{ false: "var(--muted)", true: "var(--primary)" }}
									thumbColor="var(--primary-foreground)"
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
					<View className="mt-8">
						<Button
							variant="destructive"
							size="lg"
							onPress={handleLogout}
							className="rounded-xl"
						>
							<View className="flex-row items-center justify-center gap-2">
								<Ionicons
									name="log-out-outline"
									size={20}
									color="var(--primary-foreground)"
								/>
								<Text className="font-semibold text-white">Log Out</Text>
							</View>
						</Button>
					</View>

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
