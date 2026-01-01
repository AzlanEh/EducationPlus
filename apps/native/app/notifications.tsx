import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
	Pressable,
	RefreshControl,
	ScrollView,
	Text,
	View,
} from "react-native";
import Animated, {
	FadeInDown,
	FadeInRight,
	FadeOut,
	LinearTransition,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NoNotificationsEmptyState, useToast } from "@/components/ui";

type NotificationType =
	| "course"
	| "offer"
	| "reminder"
	| "achievement"
	| "system";

type Notification = {
	id: string;
	type: NotificationType;
	title: string;
	message: string;
	timestamp: Date;
	isRead: boolean;
	action?: {
		label: string;
		route: string;
	};
};

// Mock notifications data
const mockNotifications: Notification[] = [
	{
		id: "1",
		type: "course",
		title: "New Lesson Available",
		message:
			"Physics Chapter 5: Thermodynamics is now available in your batch.",
		timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
		isRead: false,
		action: { label: "View Lesson", route: "/my-batches" },
	},
	{
		id: "2",
		type: "offer",
		title: "Special Discount!",
		message:
			"Get 30% off on all JEE Preparation courses. Valid until tomorrow!",
		timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
		isRead: false,
		action: { label: "Explore", route: "/all-batches" },
	},
	{
		id: "3",
		type: "achievement",
		title: "Badge Earned!",
		message:
			"Congratulations! You've completed 10 lessons and earned the 'Quick Learner' badge.",
		timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
		isRead: true,
	},
	{
		id: "4",
		type: "reminder",
		title: "Live Class Tomorrow",
		message:
			"Don't forget! Physics doubt clearing session starts tomorrow at 4 PM.",
		timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
		isRead: true,
		action: { label: "Add to Calendar", route: "/live-classes" },
	},
	{
		id: "5",
		type: "system",
		title: "App Update Available",
		message:
			"A new version of EduPlus is available with exciting new features!",
		timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
		isRead: true,
	},
];

const notificationStyles: Record<
	NotificationType,
	{ icon: keyof typeof Ionicons.glyphMap; color: string; bgColor: string }
> = {
	course: {
		icon: "book",
		color: "#3b82f6",
		bgColor: "bg-blue-500/10",
	},
	offer: {
		icon: "pricetag",
		color: "#f59e0b",
		bgColor: "bg-amber-500/10",
	},
	reminder: {
		icon: "alarm",
		color: "#8b5cf6",
		bgColor: "bg-violet-500/10",
	},
	achievement: {
		icon: "trophy",
		color: "#22c55e",
		bgColor: "bg-green-500/10",
	},
	system: {
		icon: "settings",
		color: "#6b7280",
		bgColor: "bg-gray-500/10",
	},
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function formatTimestamp(date: Date): string {
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / (1000 * 60));
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffMins < 60) {
		return `${diffMins}m ago`;
	}
	if (diffHours < 24) {
		return `${diffHours}h ago`;
	}
	if (diffDays < 7) {
		return `${diffDays}d ago`;
	}
	return date.toLocaleDateString();
}

function NotificationItem({
	notification,
	onPress,
	onDelete,
	index,
}: {
	notification: Notification;
	onPress: () => void;
	onDelete: () => void;
	index: number;
}) {
	const scale = useSharedValue(1);
	const style = notificationStyles[notification.type];

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

	const handleDelete = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		onDelete();
	};

	return (
		<AnimatedPressable
			onPress={handlePress}
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
			style={animatedStyle}
		>
			<Animated.View
				entering={FadeInRight.delay(index * 50)
					.springify()
					.damping(15)}
				exiting={FadeOut.duration(200)}
				layout={LinearTransition.springify()}
				className={`mb-3 overflow-hidden rounded-2xl ${notification.isRead ? "bg-card" : "border-primary border-l-4 bg-card"}`}
			>
				<View className="flex-row p-4">
					{/* Icon */}
					<View
						className={`mr-3 h-12 w-12 items-center justify-center rounded-xl ${style.bgColor}`}
					>
						<Ionicons name={style.icon} size={24} color={style.color} />
					</View>

					{/* Content */}
					<View className="flex-1">
						<View className="mb-1 flex-row items-start justify-between">
							<Text
								className="flex-1 font-semibold text-base text-foreground"
								numberOfLines={1}
							>
								{notification.title}
							</Text>
							<Pressable
								onPress={handleDelete}
								hitSlop={8}
								className="ml-2 p-1"
							>
								<Ionicons name="close" size={18} color="var(--muted)" />
							</Pressable>
						</View>
						<Text
							className="mb-2 text-muted-foreground text-sm"
							numberOfLines={2}
						>
							{notification.message}
						</Text>
						<View className="flex-row items-center justify-between">
							<Text className="text-muted-foreground text-xs">
								{formatTimestamp(notification.timestamp)}
							</Text>
							{notification.action && (
								<View className="rounded-full bg-primary/10 px-3 py-1">
									<Text className="font-medium text-primary text-xs">
										{notification.action.label}
									</Text>
								</View>
							)}
						</View>
					</View>
				</View>

				{/* Unread indicator */}
				{!notification.isRead && (
					<View className="absolute top-4 right-12 h-2 w-2 rounded-full bg-primary" />
				)}
			</Animated.View>
		</AnimatedPressable>
	);
}

export default function Notifications() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { showToast } = useToast();
	const [notifications, setNotifications] =
		useState<Notification[]>(mockNotifications);
	const [isRefreshing, setIsRefreshing] = useState(false);

	const unreadCount = notifications.filter((n) => !n.isRead).length;

	const handleRefresh = useCallback(async () => {
		setIsRefreshing(true);
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		await new Promise((resolve) => setTimeout(resolve, 1500));
		setIsRefreshing(false);
		showToast({
			type: "success",
			title: "Refreshed",
			message: "Notifications updated",
		});
	}, [showToast]);

	const handleNotificationPress = (notification: Notification) => {
		setNotifications((prev) =>
			prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)),
		);

		if (notification.action?.route) {
			showToast({
				type: "info",
				title: "Navigating",
				message: `Going to ${notification.action.label}`,
			});
		}
	};

	const handleDeleteNotification = (id: string) => {
		setNotifications((prev) => prev.filter((n) => n.id !== id));
		showToast({
			type: "success",
			title: "Deleted",
			message: "Notification removed",
		});
	};

	const handleMarkAllRead = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
		showToast({
			type: "success",
			title: "All read",
			message: "All notifications marked as read",
		});
	};

	const handleClearAll = () => {
		Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
		showToast({
			type: "warning",
			title: "Clear all?",
			message: "This will delete all notifications",
			action: {
				label: "Confirm",
				onPress: () => {
					setNotifications([]);
					showToast({
						type: "success",
						title: "Cleared",
						message: "All notifications cleared",
					});
				},
			},
		});
	};

	const todayNotifications = notifications.filter(
		(n) => new Date().toDateString() === n.timestamp.toDateString(),
	);
	const earlierNotifications = notifications.filter(
		(n) => new Date().toDateString() !== n.timestamp.toDateString(),
	);

	return (
		<View className="flex-1 bg-background">
			{/* Header */}
			<View
				className="border-border border-b bg-card px-5 pb-4"
				style={{ paddingTop: insets.top + 8 }}
			>
				<View className="flex-row items-center justify-between">
					<View className="flex-row items-center">
						<Pressable
							onPress={() => {
								Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
								router.back();
							}}
							className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-secondary"
						>
							<Ionicons name="arrow-back" size={20} color="var(--foreground)" />
						</Pressable>
						<View>
							<Text className="font-bold text-foreground text-xl">
								Notifications
							</Text>
							{unreadCount > 0 && (
								<Text className="text-muted-foreground text-sm">
									{unreadCount} unread
								</Text>
							)}
						</View>
					</View>

					{notifications.length > 0 && (
						<View className="flex-row gap-2">
							{unreadCount > 0 && (
								<Pressable
									onPress={handleMarkAllRead}
									className="h-10 w-10 items-center justify-center rounded-full bg-secondary"
								>
									<Ionicons
										name="checkmark-done"
										size={20}
										color="var(--primary)"
									/>
								</Pressable>
							)}
							<Pressable
								onPress={handleClearAll}
								className="h-10 w-10 items-center justify-center rounded-full bg-secondary"
							>
								<Ionicons
									name="trash-outline"
									size={20}
									color="var(--destructive)"
								/>
							</Pressable>
						</View>
					)}
				</View>
			</View>

			{/* Content */}
			<ScrollView
				className="flex-1 px-5 pt-4"
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={isRefreshing}
						onRefresh={handleRefresh}
						tintColor="var(--primary)"
					/>
				}
				contentContainerStyle={{
					paddingBottom: insets.bottom + 20,
					flexGrow: 1,
				}}
			>
				{notifications.length === 0 ? (
					<NoNotificationsEmptyState />
				) : (
					<>
						{/* Today's notifications */}
						{todayNotifications.length > 0 && (
							<Animated.View
								entering={FadeInDown.springify().damping(15)}
								className="mb-2"
							>
								<Text className="mb-3 font-semibold text-muted-foreground text-xs tracking-wider">
									TODAY
								</Text>
								{todayNotifications.map((notification, idx) => (
									<NotificationItem
										key={notification.id}
										notification={notification}
										onPress={() => handleNotificationPress(notification)}
										onDelete={() => handleDeleteNotification(notification.id)}
										index={idx}
									/>
								))}
							</Animated.View>
						)}

						{/* Earlier notifications */}
						{earlierNotifications.length > 0 && (
							<Animated.View
								entering={FadeInDown.delay(100).springify().damping(15)}
								className="mb-2"
							>
								<Text className="mb-3 font-semibold text-muted-foreground text-xs tracking-wider">
									EARLIER
								</Text>
								{earlierNotifications.map((notification, idx) => (
									<NotificationItem
										key={notification.id}
										notification={notification}
										onPress={() => handleNotificationPress(notification)}
										onDelete={() => handleDeleteNotification(notification.id)}
										index={idx + todayNotifications.length}
									/>
								))}
							</Animated.View>
						)}
					</>
				)}
			</ScrollView>
		</View>
	);
}
