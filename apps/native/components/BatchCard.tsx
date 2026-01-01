import { Ionicons } from "@expo/vector-icons";
import { cn } from "heroui-native";
import {
	Image,
	type ImageSourcePropType,
	Pressable,
	Text,
	View,
} from "react-native";

type BatchCardProps = {
	banner: ImageSourcePropType;
	title: string;
	subtitle?: string;
	instructor?: string;
	startDate?: string;
	endDate?: string;
	price: number;
	originalPrice?: number;
	isNew?: boolean;
	onExplore?: () => void;
	onBuyNow?: () => void;
	className?: string;
};

export function BatchCard({
	banner,
	title: _title,
	subtitle,
	instructor,
	startDate,
	endDate,
	price,
	originalPrice,
	isNew = false,
	onExplore,
	onBuyNow,
	className,
}: BatchCardProps) {
	void _title; // Reserved for future use
	return (
		<View
			className={cn(
				"mb-4 overflow-hidden rounded-2xl bg-secondary shadow-sm",
				className,
			)}
		>
			{/* Banner Image */}
			<View className="relative">
				<Image
					source={banner}
					style={{ width: "100%", height: 160 }}
					resizeMode="cover"
				/>
				{isNew && (
					<View className="absolute top-2 right-2 rounded-md bg-success px-2 py-1">
						<Text className="font-semibold text-white text-xs">New</Text>
					</View>
				)}
			</View>

			{/* Content */}
			<View className="p-4">
				{/* Instructor & Class Info */}
				{(instructor || subtitle) && (
					<View className="mb-2 flex-row items-center">
						<Ionicons name="school-outline" size={14} color="#64748b" />
						<Text className="ml-1 text-muted-foreground text-xs">
							{instructor || subtitle}
						</Text>
					</View>
				)}

				{/* Date Info */}
				{(startDate || endDate) && (
					<View className="mb-3 flex-row items-center">
						<Ionicons name="calendar-outline" size={14} color="#64748b" />
						<Text className="ml-1 text-muted-foreground text-xs">
							{startDate && `Starts on ${startDate}`}
							{startDate && endDate && " | "}
							{endDate && `Ends on ${endDate}`}
						</Text>
					</View>
				)}

				{/* Price and Actions */}
				<View className="flex-row items-center justify-between">
					<View className="flex-row items-center">
						<Text className="font-bold text-foreground text-lg">
							₹ {price.toLocaleString()}
						</Text>
						{originalPrice && originalPrice > price && (
							<Text className="ml-2 text-muted text-sm line-through">
								₹{originalPrice.toLocaleString()}
							</Text>
						)}
					</View>

					<View className="flex-row gap-2">
						{onExplore && (
							<Pressable
								onPress={onExplore}
								className="rounded-lg border border-primary px-4 py-2"
							>
								<Text className="font-semibold text-primary text-sm">
									EXPLORE
								</Text>
							</Pressable>
						)}
						{onBuyNow && (
							<Pressable
								onPress={onBuyNow}
								className="rounded-lg bg-primary px-4 py-2"
							>
								<Text className="font-semibold text-sm text-white">
									BUY NOW
								</Text>
							</Pressable>
						)}
					</View>
				</View>
			</View>
		</View>
	);
}

// Keep default export for backward compatibility
export default BatchCard;
