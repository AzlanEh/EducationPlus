import { cn } from "heroui-native";
import {
	Image,
	type ImageSourcePropType,
	Pressable,
	Text,
	View,
} from "react-native";

type CategoryCardProps = {
	title: string;
	icon: ImageSourcePropType;
	onPress?: () => void;
	className?: string;
};

export function CategoryCard({
	title,
	icon,
	onPress,
	className,
}: CategoryCardProps) {
	return (
		<Pressable onPress={onPress} className={cn("mr-3 items-center", className)}>
			<View className="mb-2 h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-primary/20 bg-secondary">
				<Image
					source={icon}
					style={{ width: 32, height: 32 }}
					resizeMode="contain"
				/>
			</View>
			<Text className="text-center font-semibold text-foreground text-xs">
				{title}
			</Text>
		</Pressable>
	);
}

// Keep default export for backward compatibility
export default CategoryCard;
