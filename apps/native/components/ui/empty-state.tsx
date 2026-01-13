import { Ionicons } from "@expo/vector-icons";
import { cn } from "heroui-native";
import { Image, type ImageSourcePropType, Text, View } from "react-native";
import { Button } from "./button";

type EmptyStateProps = {
	title: string;
	description?: string;
	icon?: keyof typeof Ionicons.glyphMap;
	image?: ImageSourcePropType;
	action?: {
		label: string;
		onPress: () => void;
	};
	secondaryAction?: {
		label: string;
		onPress: () => void;
	};
	className?: string;
};

export function EmptyState({
	title,
	description,
	icon,
	image,
	action,
	secondaryAction,
	className,
}: EmptyStateProps) {
	return (
		<View
			className={cn("flex-1 items-center justify-center px-8 py-12", className)}
		>
			{/* Image or Icon */}
			{image ? (
				<Image
					source={image}
					style={{ width: 200, height: 200 }}
					resizeMode="contain"
					className="mb-6"
				/>
			) : icon ? (
				<View className="mb-6 items-center justify-center rounded-full bg-secondary p-6">
					<Ionicons name={icon} size={48} color="var(--muted-foreground)" />
				</View>
			) : null}

			{/* Title */}
			<Text className="mb-2 text-center font-semibold text-foreground text-lg">
				{title}
			</Text>

			{/* Description */}
			{description && (
				<Text className="mb-6 text-center text-muted-foreground">
					{description}
				</Text>
			)}

			{/* Actions */}
			{(action || secondaryAction) && (
				<View className="w-full gap-3">
					{action && (
						<Button onPress={action.onPress} fullWidth>
							{action.label}
						</Button>
					)}
					{secondaryAction && (
						<Button
							variant="outline"
							onPress={secondaryAction.onPress}
							fullWidth
						>
							{secondaryAction.label}
						</Button>
					)}
				</View>
			)}
		</View>
	);
}

// Pre-configured empty states for common scenarios
type NoBatchesEmptyStateProps = {
	title?: string;
	description?: string;
	onAction?: () => void;
	actionLabel?: string;
};

export function NoBatchesEmptyState({
	title = "No Batches Yet",
	description = "You haven't enrolled in any batches yet. Browse our courses to get started on your learning journey.",
	onAction,
	actionLabel = "Browse Batches",
}: NoBatchesEmptyStateProps = {}) {
	return (
		<EmptyState
			icon="school-outline"
			title={title}
			description={description}
			action={
				onAction
					? {
							label: actionLabel,
							onPress: onAction,
						}
					: undefined
			}
		/>
	);
}

type NoCoursesEmptyStateProps = {
	title?: string;
	description?: string;
	onAction?: () => void;
	actionLabel?: string;
};

export function NoCoursesEmptyState({
	title = "No Courses Found",
	description = "There are no courses available at the moment. Check back later for new content.",
	onAction,
	actionLabel = "Refresh",
}: NoCoursesEmptyStateProps = {}) {
	return (
		<EmptyState
			icon="book-outline"
			title={title}
			description={description}
			action={
				onAction
					? {
							label: actionLabel,
							onPress: onAction,
						}
					: undefined
			}
		/>
	);
}

type NoSearchResultsEmptyStateProps = {
	onClear?: () => void;
};

export function NoSearchResultsEmptyState({
	onClear,
}: NoSearchResultsEmptyStateProps = {}) {
	return (
		<EmptyState
			icon="search-outline"
			title="No Results Found"
			description="We couldn't find anything matching your search. Try different keywords or browse our categories."
			action={
				onClear
					? {
							label: "Clear Search",
							onPress: onClear,
						}
					: undefined
			}
		/>
	);
}

export function NoLiveClassesEmptyState() {
	return (
		<EmptyState
			icon="videocam-outline"
			title="No Live Classes"
			description="There are no live classes happening right now. Check the schedule for upcoming sessions."
		/>
	);
}

export function NoNotificationsEmptyState() {
	return (
		<EmptyState
			icon="notifications-outline"
			title="All Caught Up"
			description="You have no new notifications. We'll let you know when something important happens."
		/>
	);
}
