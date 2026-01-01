import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Card } from "heroui-native";
import { Image, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import { BottomNavigation } from "@/components/bottom-navigation";
import { useUser } from "@/hooks/useUser";

type StatItemProps = {
	icon: keyof typeof Ionicons.glyphMap;
	value: number;
	label: string;
	color: string;
	showBorder?: boolean;
};

function StatItem({
	icon,
	value,
	label,
	color,
	showBorder = true,
}: StatItemProps) {
	return (
		<View
			className={`flex-1 items-center py-3 ${showBorder ? "border-border border-r" : ""}`}
		>
			<Ionicons name={icon} size={24} color={color} />
			<Text className="mt-1 font-bold text-foreground text-lg">{value}</Text>
			<Text className="text-muted text-xs">{label}</Text>
		</View>
	);
}

function HeaderBackground() {
	return (
		<Svg
			width="100%"
			height="100%"
			preserveAspectRatio="none"
			viewBox="0 0 400 200"
		>
			<Defs>
				<LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
					<Stop offset="0%" stopColor="#7cb342" />
					<Stop offset="50%" stopColor="#9ccc65" />
					<Stop offset="100%" stopColor="#c5e1a5" />
				</LinearGradient>
			</Defs>
			<Rect x="0" y="0" width="400" height="200" fill="url(#grad)" />
			{/* Decorative wave curves */}
			<Path
				d="M250,20 Q350,60 420,40 L420,120 Q350,100 250,140 Q150,180 100,140 L100,80 Q150,60 250,20"
				fill="rgba(255,255,255,0.15)"
			/>
			<Path
				d="M280,40 Q380,80 450,60 L450,140 Q380,120 280,160 Q180,200 130,160 L130,100 Q180,80 280,40"
				fill="rgba(255,255,255,0.1)"
			/>
		</Svg>
	);
}

export default function Profile() {
	const { user } = useUser();
	const router = useRouter();
	const insets = useSafeAreaInsets();

	const handleNavigate = (route: string) => {
		if (route === "home") {
			router.push("/home");
		} else if (route === "batches") {
			router.push("/my-batches");
		} else if (route === "profile") {
			router.push("/profile");
		}
	};

	return (
		<View className="flex-1 bg-background">
			{/* Header with gradient background */}
			<View className="relative h-48">
				<View className="absolute inset-0">
					<HeaderBackground />
				</View>

				{/* Header label */}
				<Text
					className="absolute top-2 left-4 text-gray-600 text-xs"
					style={{ paddingTop: insets.top }}
				>
					SETTING
				</Text>

				{/* Navigation buttons */}
				<View
					className="absolute left-4 right-4 flex-row justify-between"
					style={{ paddingTop: insets.top + 24 }}
				>
					<Pressable
						onPress={() => router.back()}
						className="h-10 w-10 items-center justify-center rounded-full bg-white shadow-md"
						style={{
							shadowColor: "#000",
							shadowOffset: { width: 0, height: 2 },
							shadowOpacity: 0.1,
							shadowRadius: 4,
							elevation: 3,
						}}
					>
						<Ionicons name="arrow-back" size={20} color="#333" />
					</Pressable>
					<Pressable
						className="h-10 w-10 items-center justify-center rounded-full bg-white shadow-md"
						style={{
							shadowColor: "#000",
							shadowOffset: { width: 0, height: 2 },
							shadowOpacity: 0.1,
							shadowRadius: 4,
							elevation: 3,
						}}
					>
						<Ionicons name="refresh" size={20} color="#4CAF50" />
					</Pressable>
				</View>
			</View>

			{/* Profile content */}
			<View className="-mt-16 flex-1 px-6">
				{/* Avatar with edit button */}
				<View className="relative mb-4 items-center">
					<View
						className="relative"
						style={{
							shadowColor: "#000",
							shadowOffset: { width: 0, height: 2 },
							shadowOpacity: 0.2,
							shadowRadius: 4,
							elevation: 5,
						}}
					>
						<Image
							source={{ uri: user.avatar }}
							className="h-28 w-28 rounded-full border-4 border-white"
						/>
						<Pressable
							className="absolute right-0 bottom-0 h-8 w-8 items-center justify-center rounded-full bg-green-500"
							style={{
								shadowColor: "#000",
								shadowOffset: { width: 0, height: 1 },
								shadowOpacity: 0.2,
								shadowRadius: 2,
								elevation: 2,
							}}
						>
							<Ionicons name="pencil" size={14} color="#fff" />
						</Pressable>
					</View>
				</View>

				{/* User name */}
				<Text className="mb-1 text-center font-bold text-foreground text-xl">
					{user.name.toUpperCase()}
				</Text>

				{/* Location */}
				<View className="mb-6 flex-row items-center justify-center">
					<Ionicons name="location" size={16} color="#9ca3af" />
					<Text className="ml-1 text-muted">{user.location}</Text>
				</View>

				{/* Stats card */}
				<Card
					variant="secondary"
					className="mb-6 overflow-hidden rounded-xl"
					style={{
						shadowColor: "#000",
						shadowOffset: { width: 0, height: 2 },
						shadowOpacity: 0.1,
						shadowRadius: 8,
						elevation: 4,
					}}
				>
					<View className="flex-row">
						<StatItem
							icon="ribbon"
							value={user.rank || 0}
							label="Rank"
							color="#4CAF50"
						/>
						<StatItem
							icon="document-text"
							value={user.documents || 0}
							label="Document"
							color="#4CAF50"
						/>
						<StatItem
							icon="cloud-download"
							value={user.downloads || 0}
							label="Download"
							color="#4CAF50"
							showBorder={false}
						/>
					</View>
				</Card>
			</View>

			{/* Bottom Navigation */}
			<View style={{ paddingBottom: insets.bottom }}>
				<BottomNavigation currentRoute="profile" onNavigate={handleNavigate} />
			</View>
		</View>
	);
}
