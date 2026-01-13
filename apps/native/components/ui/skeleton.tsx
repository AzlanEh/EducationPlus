import { cn } from "heroui-native";
import { useEffect } from "react";
import { type DimensionValue, View } from "react-native";
import Animated, {
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
} from "react-native-reanimated";

type SkeletonProps = {
	width?: DimensionValue;
	height?: DimensionValue;
	borderRadius?: number;
	className?: string;
};

export function Skeleton({
	width = "100%",
	height = 20,
	borderRadius = 8,
	className,
}: SkeletonProps) {
	const shimmer = useSharedValue(0);

	useEffect(() => {
		shimmer.value = withRepeat(withTiming(1, { duration: 1500 }), -1, false);
	}, [shimmer]);

	const animatedStyle = useAnimatedStyle(() => ({
		opacity: interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.6, 0.3]),
	}));

	return (
		<Animated.View
			style={[
				{
					width,
					height,
					borderRadius,
				},
				animatedStyle,
			]}
			className={cn("bg-muted", className)}
		/>
	);
}

// Text skeleton with multiple lines
type SkeletonTextProps = {
	lines?: number;
	lastLineWidth?: DimensionValue;
	spacing?: number;
	className?: string;
};

export function SkeletonText({
	lines = 3,
	lastLineWidth = "60%",
	spacing = 8,
	className,
}: SkeletonTextProps) {
	return (
		<View className={className}>
			{Array.from({ length: lines }).map((_, index) => (
				<View key={index} style={{ marginTop: index === 0 ? 0 : spacing }}>
					<Skeleton
						width={index === lines - 1 ? lastLineWidth : "100%"}
						height={14}
					/>
				</View>
			))}
		</View>
	);
}

// BatchCard Skeleton
export function BatchCardSkeleton({ className }: { className?: string }) {
	return (
		<View
			className={cn("mb-4 overflow-hidden rounded-2xl bg-secondary", className)}
		>
			{/* Header */}
			<View className="flex-row items-center justify-between bg-card px-4 py-3">
				<Skeleton width={150} height={18} />
				<Skeleton width={40} height={20} borderRadius={6} />
			</View>

			{/* Banner */}
			<Skeleton width="100%" height={160} borderRadius={0} />

			{/* Content */}
			<View className="p-4">
				{/* Instructor */}
				<View className="mb-2 flex-row items-center">
					<Skeleton width={14} height={14} borderRadius={7} />
					<View className="ml-2">
						<Skeleton width={120} height={12} />
					</View>
				</View>

				{/* Date */}
				<View className="mb-3 flex-row items-center">
					<Skeleton width={14} height={14} borderRadius={7} />
					<View className="ml-2">
						<Skeleton width={180} height={12} />
					</View>
				</View>

				{/* Price and Buttons */}
				<View className="flex-row items-center justify-between">
					<View>
						<Skeleton width={80} height={20} />
						<View className="mt-1">
							<Skeleton width={60} height={12} />
						</View>
					</View>
					<View className="flex-row gap-2">
						<Skeleton width={80} height={36} borderRadius={8} />
						<Skeleton width={80} height={36} borderRadius={8} />
					</View>
				</View>
			</View>
		</View>
	);
}

// CourseCard Skeleton
export function CourseCardSkeleton({ className }: { className?: string }) {
	return (
		<View
			className={cn(
				"mb-3 flex-row overflow-hidden rounded-xl bg-card p-3",
				className,
			)}
		>
			{/* Thumbnail */}
			<Skeleton width={100} height={70} borderRadius={8} />

			{/* Content */}
			<View className="ml-3 flex-1 justify-center">
				<Skeleton width="80%" height={16} />
				<View className="mt-2">
					<Skeleton width="50%" height={12} />
				</View>
				<View className="mt-3">
					<Skeleton width="100%" height={6} borderRadius={3} />
				</View>
			</View>
		</View>
	);
}

// CategoryCard Skeleton
export function CategoryCardSkeleton({ className }: { className?: string }) {
	return (
		<View className={cn("mr-4 items-center", className)}>
			<Skeleton width={64} height={64} borderRadius={32} />
			<View className="mt-2">
				<Skeleton width={50} height={12} />
			</View>
		</View>
	);
}

// Profile Header Skeleton
export function ProfileHeaderSkeleton({ className }: { className?: string }) {
	return (
		<View className={cn("items-center", className)}>
			<Skeleton width={96} height={96} borderRadius={48} />
			<View className="mt-3">
				<Skeleton width={120} height={20} />
			</View>
			<View className="mt-2">
				<Skeleton width={80} height={14} />
			</View>
		</View>
	);
}

// List Skeleton - for loading lists
type ListSkeletonProps = {
	count?: number;
	ItemSkeleton: React.ComponentType<{ className?: string }>;
	className?: string;
};

export function ListSkeleton({
	count = 3,
	ItemSkeleton,
	className,
}: ListSkeletonProps) {
	return (
		<View className={className}>
			{Array.from({ length: count }).map((_, index) => (
				<ItemSkeleton key={index} />
			))}
		</View>
	);
}
