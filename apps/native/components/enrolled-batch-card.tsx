import { Ionicons } from "@expo/vector-icons";
import { cn } from "heroui-native";
import {
	Image,
	type ImageSourcePropType,
	Pressable,
	Text,
	View,
} from "react-native";

type EnrolledBatchCardProps = {
	banner: ImageSourcePropType;
	title: string;
	instructor?: string;
	purchaseDate?: string;
	timing?: string;
	onViewClasses?: () => void;
	className?: string;
};

export function EnrolledBatchCard({
	banner,
	title,
	instructor,
	purchaseDate,
	timing,
	onViewClasses,
	className,
}: EnrolledBatchCardProps) {
	return (
		<View
			className={cn(
				"mb-4 overflow-hidden rounded-2xl border border-border bg-secondary shadow-sm",
				className,
			)}
		>
			{/* Title Header */}
			<View className="px-4 py-3">
				<Text className="font-bold text-foreground">{title}</Text>
			</View>

			{/* Banner Image */}
			<View className="px-4">
				<Image
					source={banner}
					style={{ width: "100%", height: 140, borderRadius: 12 }}
					resizeMode="cover"
				/>
			</View>

			{/* Content */}
			<View className="p-4">
				{/* Instructor Info */}
				{instructor && (
					<View className="mb-2 flex-row items-center">
						<Ionicons
							name="school-outline"
							size={14}
							color="var(--muted-foreground)"
						/>
						<Text className="ml-2 text-muted-foreground text-xs">
							{instructor}
						</Text>
					</View>
				)}

				{/* Purchase Date */}
				{purchaseDate && (
					<View className="mb-2 flex-row items-center">
						<Ionicons
							name="calendar-outline"
							size={14}
							color="var(--muted-foreground)"
						/>
						<Text className="ml-2 text-muted-foreground text-xs">
							Purchase Date {purchaseDate}
						</Text>
					</View>
				)}

				{/* Timing */}
				{timing && (
					<View className="mb-4 flex-row items-center">
						<Ionicons
							name="time-outline"
							size={14}
							color="var(--muted-foreground)"
						/>
						<Text className="ml-2 text-muted-foreground text-xs">
							Timing {timing}
						</Text>
					</View>
				)}

				{/* View Classes Button */}
				{onViewClasses && (
					<Pressable
						onPress={onViewClasses}
						className="items-center rounded-xl bg-primary py-3"
					>
						<Text className="font-semibold text-primary-foreground text-sm">
							VIEW CLASSES
						</Text>
					</Pressable>
				)}
			</View>
		</View>
	);
}
