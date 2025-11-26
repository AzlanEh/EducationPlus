import { cn } from "heroui-native";
import { View } from "react-native";

export function ProgressBar({ value }: { value: number }) {
	const v = Math.max(0, Math.min(100, value));
	return (
		<View className="h-2 w-full overflow-hidden rounded-full bg-muted">
			<View style={{ width: `${v}%` }} className={cn("h-full bg-primary")} />
		</View>
	);
}
