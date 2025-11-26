import { Pressable, Text } from "react-native";

export function CategoryChip({
	label,
	selected,
	onPress,
}: {
	label: string;
	selected?: boolean;
	onPress?: () => void;
}) {
	return (
		<Pressable
			onPress={onPress}
			className={
				selected
					? "mr-2 rounded-full bg-primary/15 px-4 py-2"
					: "mr-2 rounded-full bg-secondary px-4 py-2"
			}
		>
			<Text
				className={selected ? "text-primary text-xs" : "text-muted text-xs"}
			>
				{label}
			</Text>
		</Pressable>
	);
}
