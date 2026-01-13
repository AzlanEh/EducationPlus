import { Ionicons } from "@expo/vector-icons";
import { cn } from "heroui-native";
import { Text, View } from "react-native";
import { Button } from "./button";

type ErrorStateProps = {
	title?: string;
	description?: string;
	icon?: keyof typeof Ionicons.glyphMap;
	onRetry?: () => void;
	retryLabel?: string;
	onSecondaryAction?: () => void;
	secondaryLabel?: string;
	className?: string;
	compact?: boolean;
};

export function ErrorState({
	title = "Something went wrong",
	description = "We encountered an error while loading. Please try again.",
	icon = "alert-circle-outline",
	onRetry,
	retryLabel = "Try Again",
	onSecondaryAction,
	secondaryLabel = "Go Back",
	className,
	compact = false,
}: ErrorStateProps) {
	if (compact) {
		return (
			<View
				className={cn(
					"flex-row items-center rounded-xl bg-danger/10 p-4",
					className,
				)}
			>
				<Ionicons name={icon} size={24} color="var(--danger)" />
				<View className="ml-3 flex-1">
					<Text className="font-medium text-danger">{title}</Text>
					{description && (
						<Text className="mt-0.5 text-danger/80 text-sm">{description}</Text>
					)}
				</View>
				{onRetry && (
					<Button
						variant="ghost"
						size="sm"
						onPress={onRetry}
						leftIcon="refresh-outline"
					>
						Retry
					</Button>
				)}
			</View>
		);
	}

	return (
		<View
			className={cn("flex-1 items-center justify-center px-8 py-12", className)}
		>
			{/* Error Icon */}
			<View className="mb-6 items-center justify-center rounded-full bg-danger/10 p-6">
				<Ionicons name={icon} size={48} color="var(--danger)" />
			</View>

			{/* Title */}
			<Text className="mb-2 text-center font-semibold text-foreground text-lg">
				{title}
			</Text>

			{/* Description */}
			<Text className="mb-6 text-center text-muted-foreground">
				{description}
			</Text>

			{/* Actions */}
			<View className="w-full gap-3">
				{onRetry && (
					<Button onPress={onRetry} leftIcon="refresh-outline" fullWidth>
						{retryLabel}
					</Button>
				)}
				{onSecondaryAction && (
					<Button variant="outline" onPress={onSecondaryAction} fullWidth>
						{secondaryLabel}
					</Button>
				)}
			</View>
		</View>
	);
}

// Pre-configured error states for common scenarios
export function NetworkErrorState({ onRetry }: { onRetry: () => void }) {
	return (
		<ErrorState
			icon="cloud-offline-outline"
			title="No Internet Connection"
			description="Please check your internet connection and try again."
			onRetry={onRetry}
		/>
	);
}

export function ServerErrorState({ onRetry }: { onRetry: () => void }) {
	return (
		<ErrorState
			icon="server-outline"
			title="Server Error"
			description="Our servers are having issues. Please try again in a few moments."
			onRetry={onRetry}
		/>
	);
}

export function NotFoundErrorState({ onGoBack }: { onGoBack: () => void }) {
	return (
		<ErrorState
			icon="search-outline"
			title="Not Found"
			description="The content you're looking for doesn't exist or has been removed."
			onSecondaryAction={onGoBack}
			secondaryLabel="Go Back"
		/>
	);
}

export function AuthErrorState({ onLogin }: { onLogin: () => void }) {
	return (
		<ErrorState
			icon="lock-closed-outline"
			title="Session Expired"
			description="Your session has expired. Please log in again to continue."
			onRetry={onLogin}
			retryLabel="Log In"
		/>
	);
}
