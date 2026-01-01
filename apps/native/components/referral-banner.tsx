import { Ionicons } from "@expo/vector-icons";
import { cn } from "heroui-native";
import { Image, Pressable, Text, View } from "react-native";

type ReferralBannerProps = {
	onSharePress?: () => void;
	className?: string;
};

export function ReferralBanner({
	onSharePress,
	className,
}: ReferralBannerProps) {
	return (
		<View
			className={cn(
				"mb-6 overflow-hidden rounded-2xl bg-muted/30 p-5",
				className,
			)}
		>
			<View className="flex-row items-center justify-between">
				<View className="flex-1">
					<Text className="mb-1 text-muted-foreground text-sm">
						Refer your friends &
					</Text>
					<Text className="mb-3 font-bold text-foreground text-lg">
						Earn Plus+ Coins!
					</Text>
					<Pressable
						onPress={onSharePress}
						className="flex-row items-center self-start rounded-full bg-secondary px-4 py-2 shadow-sm"
					>
						<Ionicons
							name="share-social-outline"
							size={16}
							color="var(--success)"
						/>
						<Text className="ml-2 font-semibold text-foreground text-sm">
							Share Now
						</Text>
					</Pressable>
				</View>
				<Image
					source={require("../assets/images/kids-book.png")}
					style={{ width: 120, height: 100 }}
					className="rounded-xl"
					resizeMode="cover"
				/>
			</View>
		</View>
	);
}
