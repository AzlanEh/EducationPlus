import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
	Pressable,
	RefreshControl,
	ScrollView,
	Text,
	View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomNavigation } from "@/components/bottom-navigation";
import { useAppTheme } from "@/contexts/app-theme-context";
import { client } from "@/utils/orpc";

type LiveStreamStatus =
	| "scheduled"
	| "not_started"
	| "starting"
	| "running"
	| "stopping"
	| "stopped"
	| "ended";

interface LiveStream {
	_id: string;
	title: string;
	description?: string;
	bunnyStreamId: string;
	playbackUrl?: string;
	status: LiveStreamStatus;
	scheduledAt?: string;
	startedAt?: string;
	thumbnailUrl?: string;
	isPublished: boolean;
}

type LiveClassItemProps = {
	stream: LiveStream;
	onPress?: () => void;
};

function LiveStatusBadge({ status }: { status: LiveStreamStatus }) {
	if (status === "running") {
		return (
			<View className="flex-row items-center rounded-full bg-danger px-2 py-1">
				<View className="mr-1 h-2 w-2 animate-pulse rounded-full bg-white" />
				<Text className="font-bold text-white text-xs">LIVE</Text>
			</View>
		);
	}
	if (status === "starting") {
		return (
			<View className="flex-row items-center rounded-full bg-warning px-2 py-1">
				<Text className="font-medium text-white text-xs">Starting...</Text>
			</View>
		);
	}
	if (status === "scheduled") {
		return (
			<View className="flex-row items-center rounded-full bg-primary/20 px-2 py-1">
				<Ionicons name="time-outline" size={12} color="var(--primary)" />
				<Text className="ml-1 font-medium text-primary text-xs">Scheduled</Text>
			</View>
		);
	}
	return null;
}

function formatScheduledTime(dateStr: string | undefined): string {
	if (!dateStr) return "";
	const date = new Date(dateStr);
	const now = new Date();
	const diffMs = date.getTime() - now.getTime();
	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMs / 3600000);
	const diffDays = Math.floor(diffMs / 86400000);

	if (diffMs < 0) return "Starting soon";
	if (diffMins < 60) return `Starts in ${diffMins} min`;
	if (diffHours < 24) return `Starts in ${diffHours}h`;
	if (diffDays === 1) return "Tomorrow";
	return date.toLocaleDateString(undefined, {
		weekday: "short",
		month: "short",
		day: "numeric",
	});
}

function LiveClassItem({ stream, onPress }: LiveClassItemProps) {
	const isLive = stream.status === "running" || stream.status === "starting";

	return (
		<Pressable
			onPress={onPress}
			className={`border-border border-b py-4 ${isLive ? "bg-danger/5" : ""}`}
		>
			<View className="flex-row items-start justify-between">
				<View className="flex-1 pr-3">
					<View className="mb-1 flex-row items-center">
						<LiveStatusBadge status={stream.status} />
					</View>
					<Text
						className={`font-semibold ${isLive ? "text-danger" : "text-foreground"}`}
					>
						{stream.title}
					</Text>
					{stream.description && (
						<Text
							className="mt-1 text-muted-foreground text-sm"
							numberOfLines={2}
						>
							{stream.description}
						</Text>
					)}
					{stream.status === "scheduled" && stream.scheduledAt && (
						<Text className="mt-1 text-muted-foreground text-xs">
							{formatScheduledTime(stream.scheduledAt)}
						</Text>
					)}
				</View>
				<View className="items-center justify-center">
					{isLive ? (
						<View className="rounded-full bg-danger p-2">
							<Ionicons name="play" size={20} color="white" />
						</View>
					) : (
						<View className="rounded-full bg-muted p-2">
							<Ionicons
								name="time-outline"
								size={20}
								color="var(--muted-foreground)"
							/>
						</View>
					)}
				</View>
			</View>
		</Pressable>
	);
}

export default function LiveClasses() {
	const insets = useSafeAreaInsets();
	const { colors } = useAppTheme();
	const [refreshing, setRefreshing] = useState(false);

	// Fetch published live streams
	const { data, isLoading, refetch } = useQuery({
		queryKey: ["live-streams-published"],
		queryFn: () => (client as any).v1.live.getPublished({ limit: 20 }),
		refetchInterval: 30000, // Poll every 30 seconds
	});

	const liveStreams: LiveStream[] = data?.liveStreams || [];

	// Separate live and scheduled streams
	const liveNow = liveStreams.filter(
		(s) => s.status === "running" || s.status === "starting",
	);
	const upcoming = liveStreams.filter((s) => s.status === "scheduled");

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		await refetch();
		setRefreshing(false);
	}, [refetch]);

	const handleNavigation = (route: string) => {
		if (route === "home") {
			router.push("home" as never);
		} else if (route === "batches") {
			router.push("my-batches" as never);
		} else if (route === "profile") {
			router.push("profile" as never);
		}
	};

	const handleStreamPress = (stream: LiveStream) => {
		router.push({
			pathname: "live/[streamId]" as never,
			params: { streamId: stream._id },
		});
	};

	return (
		<View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ flexGrow: 1 }}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						tintColor={colors.primary}
						colors={[colors.primary]}
					/>
				}
			>
				<Animated.View entering={FadeInDown} className="flex-1 px-4">
					{/* Header */}
					<View className="flex-row items-center justify-between py-4">
						<View className="flex-row items-center">
							<Text className="font-bold text-2xl text-danger">Live</Text>
							<Text className="font-bold text-2xl text-foreground">
								{" "}
								Classes
							</Text>
							{liveNow.length > 0 && (
								<View className="ml-2 rounded-full bg-danger px-2 py-0.5">
									<Text className="font-bold text-white text-xs">
										{liveNow.length} LIVE
									</Text>
								</View>
							)}
						</View>
						<Pressable
							onPress={() => router.back()}
							className="flex-row items-center"
						>
							<Ionicons
								name="chevron-back"
								size={24}
								color="var(--foreground)"
							/>
							<Text className="font-medium text-foreground">Back</Text>
						</Pressable>
					</View>

					{/* Divider */}
					<View className="mb-2 h-0.5 bg-danger" />

					{isLoading ? (
						<View className="flex-1 items-center justify-center py-20">
							<Ionicons name="radio-outline" size={48} color="var(--muted)" />
							<Text className="mt-4 text-center text-muted-foreground">
								Loading live classes...
							</Text>
						</View>
					) : liveStreams.length === 0 ? (
						<View className="flex-1 items-center justify-center py-20">
							<Ionicons
								name="videocam-off-outline"
								size={48}
								color="var(--muted)"
							/>
							<Text className="mt-4 text-center text-muted-foreground">
								No live classes available right now
							</Text>
							<Text className="mt-2 text-center text-muted-foreground text-sm">
								Check back later for scheduled live sessions
							</Text>
						</View>
					) : (
						<>
							{/* Live Now Section */}
							{liveNow.length > 0 && (
								<View className="mb-4">
									<Text className="mb-2 font-semibold text-danger">
										Happening Now
									</Text>
									{liveNow.map((stream) => (
										<LiveClassItem
											key={stream._id}
											stream={stream}
											onPress={() => handleStreamPress(stream)}
										/>
									))}
								</View>
							)}

							{/* Upcoming Section */}
							{upcoming.length > 0 && (
								<View>
									<Text className="mb-2 font-semibold text-foreground">
										Upcoming
									</Text>
									{upcoming.map((stream) => (
										<LiveClassItem
											key={stream._id}
											stream={stream}
											onPress={() => handleStreamPress(stream)}
										/>
									))}
								</View>
							)}
						</>
					)}
				</Animated.View>
			</ScrollView>

			{/* Bottom Navigation */}
			<BottomNavigation currentRoute="batches" onNavigate={handleNavigation} />
		</View>
	);
}
