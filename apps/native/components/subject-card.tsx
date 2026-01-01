import { Ionicons } from "@expo/vector-icons";
import { cn } from "heroui-native";
import { Pressable, Text, View } from "react-native";

type SubjectCardProps = {
	title: string;
	videoCount: number;
	pdfCount: number;
	onPress?: () => void;
	className?: string;
};

export function SubjectCard({
	title,
	videoCount,
	pdfCount,
	onPress,
	className,
}: SubjectCardProps) {
	return (
		<Pressable
			onPress={onPress}
			className={cn(
				"relative m-2 items-center rounded-xl bg-secondary p-4 shadow-sm",
				className,
			)}
			style={{ width: 100 }}
		>
			{/* Status indicator dot */}
			<View className="absolute top-2 right-2 h-2 w-2 rounded-full bg-success" />

			{/* Folder Icon */}
			<View className="mb-3 h-12 w-12 items-center justify-center rounded-xl bg-primary">
				<Ionicons name="folder" size={24} color="white" />
			</View>

			{/* Subject Title */}
			<Text className="mb-2 text-center font-semibold text-foreground text-sm">
				{title}
			</Text>

			{/* Stats Row */}
			<View className="flex-row items-center justify-center gap-2">
				<View className="flex-row items-center">
					<Text className="font-medium text-success text-xs">+</Text>
					<Text className="text-foreground text-xs">{videoCount} VID</Text>
				</View>
				<View className="flex-row items-center">
					<Text className="font-medium text-success text-xs">+</Text>
					<Text className="text-foreground text-xs">{pdfCount} PDF</Text>
				</View>
			</View>
		</Pressable>
	);
}
