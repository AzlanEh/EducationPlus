import { cn } from "heroui-native";
import { useState } from "react";
import { Image, type ImageSourcePropType, Text, View } from "react-native";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

type AvatarProps = {
	source?: ImageSourcePropType | null;
	name?: string;
	size?: AvatarSize;
	className?: string;
	showOnlineIndicator?: boolean;
	isOnline?: boolean;
};

const sizeStyles: Record<
	AvatarSize,
	{ container: string; text: string; indicator: string; imageSize: number }
> = {
	xs: {
		container: "h-8 w-8",
		text: "text-xs",
		indicator: "h-2 w-2 border",
		imageSize: 32,
	},
	sm: {
		container: "h-10 w-10",
		text: "text-sm",
		indicator: "h-2.5 w-2.5 border",
		imageSize: 40,
	},
	md: {
		container: "h-12 w-12",
		text: "text-base",
		indicator: "h-3 w-3 border-2",
		imageSize: 48,
	},
	lg: {
		container: "h-16 w-16",
		text: "text-lg",
		indicator: "h-4 w-4 border-2",
		imageSize: 64,
	},
	xl: {
		container: "h-24 w-24",
		text: "text-2xl",
		indicator: "h-5 w-5 border-2",
		imageSize: 96,
	},
};

// Generate a consistent color based on name
function getAvatarColor(name: string): string {
	const colors = [
		"bg-primary",
		"bg-accent",
		"bg-success",
		"bg-warning",
		"bg-info",
		"bg-accent-orange",
	];
	const index = name
		.split("")
		.reduce((acc, char) => acc + char.charCodeAt(0), 0);
	return colors[index % colors.length];
}

// Get initials from name
function getInitials(name: string): string {
	const parts = name.trim().split(" ");
	if (parts.length >= 2) {
		return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
	}
	return name.slice(0, 2).toUpperCase();
}

export function Avatar({
	source,
	name = "User",
	size = "md",
	className,
	showOnlineIndicator = false,
	isOnline = false,
}: AvatarProps) {
	const [imageError, setImageError] = useState(false);
	const sizeStyle = sizeStyles[size];
	const showFallback = !source || imageError;

	return (
		<View className={cn("relative", className)}>
			{showFallback ? (
				// Fallback with initials
				<View
					className={cn(
						"items-center justify-center rounded-full",
						sizeStyle.container,
						getAvatarColor(name),
					)}
					accessibilityLabel={`Avatar for ${name}`}
				>
					<Text className={cn("font-semibold text-white", sizeStyle.text)}>
						{getInitials(name)}
					</Text>
				</View>
			) : (
				// Image avatar
				<Image
					source={source}
					onError={() => setImageError(true)}
					className={cn("rounded-full", sizeStyle.container)}
					style={{
						width: sizeStyle.imageSize,
						height: sizeStyle.imageSize,
					}}
					accessibilityLabel={`Avatar for ${name}`}
				/>
			)}

			{/* Online indicator */}
			{showOnlineIndicator && (
				<View
					className={cn(
						"absolute right-0 bottom-0 rounded-full border-card",
						sizeStyle.indicator,
						isOnline ? "bg-success" : "bg-muted",
					)}
				/>
			)}
		</View>
	);
}

// Avatar group for showing multiple avatars
type AvatarGroupProps = {
	avatars: { source?: ImageSourcePropType; name: string }[];
	max?: number;
	size?: AvatarSize;
	className?: string;
};

export function AvatarGroup({
	avatars,
	max = 4,
	size = "sm",
	className,
}: AvatarGroupProps) {
	const visibleAvatars = avatars.slice(0, max);
	const remainingCount = avatars.length - max;
	const sizeStyle = sizeStyles[size];

	return (
		<View className={cn("flex-row", className)}>
			{visibleAvatars.map((avatar, index) => (
				<View
					key={avatar.name}
					style={{ marginLeft: index === 0 ? 0 : -8 }}
					className="rounded-full border-2 border-card"
				>
					<Avatar source={avatar.source} name={avatar.name} size={size} />
				</View>
			))}
			{remainingCount > 0 && (
				<View
					style={{ marginLeft: -8 }}
					className={cn(
						"items-center justify-center rounded-full border-2 border-card bg-secondary",
						sizeStyle.container,
					)}
				>
					<Text
						className={cn(
							"font-semibold text-muted-foreground",
							sizeStyle.text,
						)}
					>
						+{remainingCount}
					</Text>
				</View>
			)}
		</View>
	);
}
