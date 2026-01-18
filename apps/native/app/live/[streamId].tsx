import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	RefreshControl,
	ScrollView,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VideoPlayer } from "@/components/video-player";
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

function formatScheduledTime(dateStr: string | undefined): string {
	if (!dateStr) return "";
	const date = new Date(dateStr);
	return date.toLocaleString(undefined, {
		weekday: "long",
		month: "long",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
}

export default function LiveStreamPlayer() {
	const { streamId } = useLocalSearchParams<{ streamId: string }>();
	const insets = useSafeAreaInsets();
	const { colors } = useAppTheme();
	const [refreshing, setRefreshing] = useState(false);

	// Fetch live stream playback info
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ["live-stream-playback", streamId],
		queryFn: () => (client as any).v1.live.getPlayback({ id: streamId }),
		enabled: !!streamId,
		refetchInterval: (query) => {
			// Poll more frequently when waiting for stream to start
			const stream = query.state.data?.liveStream as LiveStream | undefined;
			if (stream?.status === "scheduled" || stream?.status === "not_started") {
				return 10000; // 10 seconds
			}
			if (stream?.status === "running" || stream?.status === "starting") {
				return 30000; // 30 seconds
			}
			return false; // Stop polling for ended streams
		},
	});

	const stream = data?.liveStream as LiveStream | undefined;
	const canWatch = data?.canWatch as boolean;
	const playbackUrl = data?.playbackUrl as string | undefined;
	const message = data?.message as string | undefined;

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		await refetch();
		setRefreshing(false);
	}, [refetch]);

	const handleBack = () => {
		router.back();
	};

	if (isLoading) {
		return (
			<View
				className="flex-1 items-center justify-center bg-background"
				style={{ paddingTop: insets.top }}
			>
				<ActivityIndicator size="large" color={colors.primary} />
				<Text className="mt-4 text-muted-foreground">Loading stream...</Text>
			</View>
		);
	}

	if (error || !stream) {
		return (
			<View
				className="flex-1 items-center justify-center bg-background px-6"
				style={{ paddingTop: insets.top }}
			>
				<Ionicons
					name="alert-circle-outline"
					size={64}
					color="var(--destructive)"
				/>
				<Text className="mt-4 text-center font-semibold text-foreground text-lg">
					Stream Not Found
				</Text>
				<Text className="mt-2 text-center text-muted-foreground">
					This live stream may have been removed or is not available.
				</Text>
				<Pressable
					onPress={handleBack}
					className="mt-6 rounded-full bg-primary px-6 py-3"
				>
					<Text className="font-semibold text-primary-foreground">Go Back</Text>
				</Pressable>
			</View>
		);
	}

	// Stream is live and can be watched
	if (canWatch && playbackUrl) {
		return (
			<View className="flex-1 bg-black">
				<VideoPlayer
					embedUrl={`https://iframe.mediadelivery.net/embed/${stream.bunnyStreamId}?autoplay=true`}
					playbackUrl={playbackUrl}
					thumbnailUrl={stream.thumbnailUrl}
					isLive={true}
					onBack={handleBack}
				/>
				{/* Stream info below player */}
				<View
					className="flex-1 bg-background"
					style={{ paddingBottom: insets.bottom }}
				>
					<ScrollView className="flex-1 px-4 py-4">
						<View className="mb-2 flex-row items-center">
							<View className="mr-2 flex-row items-center rounded-full bg-danger px-2 py-1">
								<View className="mr-1 h-2 w-2 rounded-full bg-white" />
								<Text className="font-bold text-white text-xs">LIVE</Text>
							</View>
							<Text className="text-muted-foreground text-sm">
								{stream.status === "running"
									? "Broadcasting now"
									: "Starting..."}
							</Text>
						</View>
						<Text className="font-bold text-foreground text-xl">
							{stream.title}
						</Text>
						{stream.description && (
							<Text className="mt-2 text-muted-foreground">
								{stream.description}
							</Text>
						)}
					</ScrollView>
				</View>
			</View>
		);
	}

	// Stream is scheduled or not started yet
	return (
		<View
			className="flex-1 bg-background"
			style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
		>
			{/* Header */}
			<View className="flex-row items-center border-border border-b px-4 py-3">
				<Pressable onPress={handleBack} className="mr-3">
					<Ionicons name="arrow-back" size={24} color="var(--foreground)" />
				</Pressable>
				<Text className="flex-1 font-semibold text-foreground text-lg">
					Live Stream
				</Text>
			</View>

			<ScrollView
				className="flex-1"
				contentContainerStyle={{ flexGrow: 1 }}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						tintColor={colors.primary}
						colors={[colors.primary]}
					/>
				}
			>
				{/* Waiting state */}
				<View className="flex-1 items-center justify-center px-6 py-12">
					{stream.status === "scheduled" ? (
						<>
							<View className="mb-6 rounded-full bg-primary/10 p-6">
								<Ionicons
									name="time-outline"
									size={64}
									color="var(--primary)"
								/>
							</View>
							<Text className="text-center font-bold text-foreground text-xl">
								Stream Scheduled
							</Text>
							<Text className="mt-4 text-center text-muted-foreground">
								This stream is scheduled to start at:
							</Text>
							<Text className="mt-2 text-center font-semibold text-lg text-primary">
								{formatScheduledTime(stream.scheduledAt)}
							</Text>
						</>
					) : stream.status === "ended" || stream.status === "stopped" ? (
						<>
							<View className="mb-6 rounded-full bg-muted p-6">
								<Ionicons
									name="checkmark-circle-outline"
									size={64}
									color="var(--muted-foreground)"
								/>
							</View>
							<Text className="text-center font-bold text-foreground text-xl">
								Stream Ended
							</Text>
							<Text className="mt-4 text-center text-muted-foreground">
								{message || "This live stream has ended."}
							</Text>
							{stream.startedAt && (
								<Text className="mt-2 text-center text-muted-foreground text-sm">
									Streamed on {formatScheduledTime(stream.startedAt)}
								</Text>
							)}
						</>
					) : (
						<>
							<View className="mb-6 rounded-full bg-warning/10 p-6">
								<Ionicons
									name="hourglass-outline"
									size={64}
									color="var(--warning)"
								/>
							</View>
							<Text className="text-center font-bold text-foreground text-xl">
								Waiting to Start
							</Text>
							<Text className="mt-4 text-center text-muted-foreground">
								{message || "The stream will begin shortly. Please wait..."}
							</Text>
							<ActivityIndicator
								size="small"
								color={colors.primary}
								style={{ marginTop: 16 }}
							/>
						</>
					)}

					{/* Stream details card */}
					<View className="mt-8 w-full rounded-xl border border-border bg-card p-4">
						<Text className="font-semibold text-foreground text-lg">
							{stream.title}
						</Text>
						{stream.description && (
							<Text className="mt-2 text-muted-foreground">
								{stream.description}
							</Text>
						)}
					</View>

					{/* Pull to refresh hint */}
					<Text className="mt-8 text-center text-muted-foreground text-sm">
						Pull down to refresh
					</Text>
				</View>
			</ScrollView>
		</View>
	);
}
