import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

export function LessonItem({
	title,
	duration,
	completed,
	onPress,
}: {
	title: string;
	duration: number;
	completed: boolean;
	onPress: () => void;
}) {
	return (
		<Pressable
			onPress={onPress}
			className="mb-3 rounded-2xl bg-secondary p-4 shadow-sm active:opacity-80"
		>
			<View className="flex-row items-center">
				<View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-primary/20">
					<Ionicons
						name={completed ? "checkmark" : "play"}
						size={18}
						color="#0ea5e9"
					/>
				</View>
				<View className="flex-1">
					<Text className="font-medium text-base text-foreground">{title}</Text>
					<Text className="text-muted text-xs">{duration} mins</Text>
				</View>
				<Ionicons
					name={completed ? "checkmark-circle" : "chevron-forward"}
					size={18}
					color={completed ? "#22c55e" : "#9ca3af"}
				/>
			</View>
		</Pressable>
	);
}
