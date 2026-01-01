import { cn } from "heroui-native";
import { Image, type ImageSourcePropType, Pressable, Text } from "react-native";

type FeatureCardProps = {
	title: string;
	icon: ImageSourcePropType;
	onPress?: () => void;
	className?: string;
};

export function FeatureCard({
	title,
	icon,
	onPress,
	className,
}: FeatureCardProps) {
	return (
		<Pressable
			onPress={onPress}
			className={cn(
				"items-center justify-center rounded-xl bg-secondary p-4",
				className,
			)}
			style={{ width: 100 }}
		>
			<Image
				source={icon}
				style={{ width: 48, height: 48 }}
				resizeMode="contain"
			/>
			<Text className="mt-2 text-center font-medium text-foreground text-xs">
				{title}
			</Text>
		</Pressable>
	);
}
