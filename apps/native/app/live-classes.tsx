import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomNavigation } from "@/components/bottom-navigation";

// Mock data for live classes
const liveClasses = [
	{
		id: "1",
		title: "Rational Number Lec-1",
		instructor: "Nadim Sir",
		subject: "Maths",
	},
	{
		id: "2",
		title: "Reproduction in Animal Lec-1",
		instructor: "Meraz Sir",
		subject: "Biology",
	},
	{
		id: "3",
		title: "Chemical Reaction Lec-6",
		instructor: "Hammad Sir",
		subject: "Chem",
	},
];

type LiveClassItemProps = {
	title: string;
	instructor: string;
	subject: string;
	onPress?: () => void;
};

function LiveClassItem({
	title,
	instructor,
	subject,
	onPress,
}: LiveClassItemProps) {
	return (
		<Pressable onPress={onPress} className="border-border border-b py-4">
			<View className="flex-row items-start justify-between">
				<View className="flex-1">
					<Text className="font-semibold text-danger">{title}</Text>
					<Text className="mt-1 text-muted-foreground text-sm">
						By {instructor}
					</Text>
				</View>
				<Text className="text-muted-foreground text-sm">{subject}</Text>
			</View>
		</Pressable>
	);
}

export default function LiveClasses() {
	const insets = useSafeAreaInsets();

	const handleNavigation = (route: string) => {
		if (route === "home") {
			router.push("home" as never);
		} else if (route === "batches") {
			router.push("my-batches" as never);
		} else if (route === "profile") {
			router.push("profile" as never);
		}
	};

	const handleClassPress = (classId: string) => {
		// Navigate to live class or video
		router.push({
			pathname: "lesson/[lessonId]" as never,
			params: { lessonId: classId },
		});
	};

	return (
		<View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ flexGrow: 1 }}
				showsVerticalScrollIndicator={false}
			>
				<Animated.View entering={FadeInDown} className="flex-1 px-4">
					{/* Header */}
					<View className="flex-row items-center justify-between py-4">
						<View className="flex-row items-center">
							<Text className="font-bold text-2xl text-danger">Live</Text>
							<Text className="font-bold text-2xl text-foreground">
								{" "}
								Classes ({liveClasses.length})
							</Text>
						</View>
						<Pressable
							onPress={() => router.back()}
							className="flex-row items-center"
						>
							<Ionicons
								name="chevron-back"
								size={24}
								color="var(--foreground)"
							/>
							<Text className="font-medium text-foreground">Back</Text>
						</Pressable>
					</View>

					{/* Divider */}
					<View className="mb-2 h-0.5 bg-danger" />

					{/* Live Classes List */}
					{liveClasses.map((liveClass) => (
						<LiveClassItem
							key={liveClass.id}
							title={liveClass.title}
							instructor={liveClass.instructor}
							subject={liveClass.subject}
							onPress={() => handleClassPress(liveClass.id)}
						/>
					))}

					{liveClasses.length === 0 && (
						<View className="flex-1 items-center justify-center py-20">
							<Ionicons
								name="videocam-off-outline"
								size={48}
								color="var(--muted)"
							/>
							<Text className="mt-4 text-center text-muted-foreground">
								No live classes available right now
							</Text>
						</View>
					)}
				</Animated.View>
			</ScrollView>

			{/* Bottom Navigation */}
			<BottomNavigation currentRoute="batches" onNavigate={handleNavigation} />
		</View>
	);
}
