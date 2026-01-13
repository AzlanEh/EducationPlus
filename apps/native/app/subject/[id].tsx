import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomNavigation } from "@/components/bottom-navigation";

// Mock data for topics by subject
const topicsBySubject: Record<string, { id: string; title: string }[]> = {
	maths: [
		{ id: "1", title: "Rational Numbers" },
		{ id: "2", title: "Square and Square Roots" },
		{ id: "3", title: "Cube and Cube roots" },
		{ id: "4", title: "Power and Exponent" },
		{ id: "5", title: "Linear equation of one Variable" },
		{ id: "6", title: "Distance, Time and Speed" },
		{ id: "7", title: "Triangle" },
		{ id: "8", title: "Area of 2-D and 3-D Figure" },
		{ id: "9", title: "Data Handling" },
	],
	physics: [
		{ id: "1", title: "Force and Pressure" },
		{ id: "2", title: "Friction" },
		{ id: "3", title: "Sound" },
		{ id: "4", title: "Light" },
		{ id: "5", title: "Stars and Solar System" },
	],
	chemistry: [
		{ id: "1", title: "Chemical Reactions" },
		{ id: "2", title: "Acids, Bases and Salts" },
		{ id: "3", title: "Metals and Non-metals" },
		{ id: "4", title: "Carbon Compounds" },
		{ id: "5", title: "Periodic Classification" },
	],
	biology: [
		{ id: "1", title: "Cell Structure" },
		{ id: "2", title: "Reproduction in Animals" },
		{ id: "3", title: "Reaching the Age of Adolescence" },
		{ id: "4", title: "Conservation of Plants" },
	],
	english: [
		{ id: "1", title: "Grammar Basics" },
		{ id: "2", title: "Reading Comprehension" },
		{ id: "3", title: "Writing Skills" },
		{ id: "4", title: "Vocabulary Building" },
	],
	hindi: [
		{ id: "1", title: "व्याकरण" },
		{ id: "2", title: "पठन कौशल" },
		{ id: "3", title: "लेखन कौशल" },
	],
	urdu: [
		{ id: "1", title: "Grammar" },
		{ id: "2", title: "Poetry" },
		{ id: "3", title: "Prose" },
	],
	history: [
		{ id: "1", title: "Ancient India" },
		{ id: "2", title: "Medieval India" },
		{ id: "3", title: "Modern India" },
		{ id: "4", title: "World History" },
	],
};

const subjectNames: Record<string, string> = {
	maths: "Mathematics",
	physics: "Physics",
	chemistry: "Chemistry",
	biology: "Biology",
	english: "English",
	hindi: "Hindi",
	urdu: "Urdu",
	history: "History",
};

type TopicItemProps = {
	title: string;
	onPress?: () => void;
};

function TopicItem({ title, onPress }: TopicItemProps) {
	return (
		<Pressable
			onPress={onPress}
			className="flex-row items-center justify-between border-border border-b py-4"
		>
			<Text className="flex-1 text-foreground">{title}</Text>
			<Ionicons name="chevron-forward" size={20} color="var(--muted)" />
		</Pressable>
	);
}

export default function SubjectTopics() {
	const insets = useSafeAreaInsets();
	const { id } = useLocalSearchParams<{ id: string }>();

	const topics = topicsBySubject[id || "maths"] || [];
	const subjectName = subjectNames[id || "maths"] || "Subject";

	const handleNavigation = (route: string) => {
		if (route === "home") {
			router.push("home" as never);
		} else if (route === "batches") {
			router.push("my-batches" as never);
		} else if (route === "profile") {
			router.push("profile" as never);
		}
	};

	const handleTopicPress = (topicId: string) => {
		// Navigate to topic lessons/videos
		router.push({
			pathname: "lesson/[lessonId]" as never,
			params: { lessonId: topicId },
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
						<Text className="font-bold text-2xl text-primary">
							{subjectName}
						</Text>
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

					{/* Topics List */}
					{topics.map((topic) => (
						<TopicItem
							key={topic.id}
							title={topic.title}
							onPress={() => handleTopicPress(topic.id)}
						/>
					))}

					{topics.length === 0 && (
						<View className="flex-1 items-center justify-center py-20">
							<Ionicons name="book-outline" size={48} color="var(--muted)" />
							<Text className="mt-4 text-center text-muted-foreground">
								No topics available for this subject
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
