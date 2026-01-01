import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { cn } from "heroui-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomNavigation } from "@/components/bottom-navigation";
import { SubjectCard } from "@/components/subject-card";

// Mock data for subjects
const subjects = [
	{ id: "maths", title: "MATHS", videoCount: 0, pdfCount: 1 },
	{ id: "physics", title: "PHYSICS", videoCount: 5, pdfCount: 10 },
	{ id: "chemistry", title: "CHEMISTRY", videoCount: 5, pdfCount: 12 },
	{ id: "biology", title: "BIOLOGY", videoCount: 0, pdfCount: 1 },
	{ id: "urdu", title: "URDU", videoCount: 5, pdfCount: 10 },
	{ id: "english", title: "ENGLISH", videoCount: 5, pdfCount: 12 },
	{ id: "hindi", title: "HINDI", videoCount: 0, pdfCount: 1 },
	{ id: "history", title: "HISTORY", videoCount: 5, pdfCount: 10 },
];

type TabType = "recorded" | "live";

export default function InsideBatch() {
	const insets = useSafeAreaInsets();
	const { id } = useLocalSearchParams<{ id: string }>();
	const [activeTab, setActiveTab] = useState<TabType>("recorded");

	void id; // Reserved for fetching batch-specific data

	const handleNavigation = (route: string) => {
		if (route === "home") {
			router.push("home" as never);
		} else if (route === "batches") {
			router.push("my-batches" as never);
		} else if (route === "profile") {
			router.push("profile" as never);
		}
	};

	const handleSubjectPress = (subjectId: string) => {
		router.push({
			pathname: "subject/[id]" as never,
			params: { id: subjectId },
		});
	};

	const handleLivePress = () => {
		router.push("live-classes" as never);
	};

	return (
		<View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
				showsVerticalScrollIndicator={false}
			>
				<Animated.View entering={FadeInDown} className="flex-1 px-4">
					{/* Back Header */}
					<Pressable
						onPress={() => router.back()}
						className="mb-4 flex-row items-center py-3"
					>
						<Ionicons name="chevron-back" size={24} color="var(--foreground)" />
						<Text className="ml-1 font-medium text-foreground text-lg">
							Back
						</Text>
					</Pressable>

					{/* Tab Buttons */}
					<View className="mb-6 flex-row justify-center gap-4">
						<Pressable
							onPress={() => setActiveTab("recorded")}
							className={cn(
								"rounded-full px-6 py-3",
								activeTab === "recorded"
									? "bg-primary"
									: "border border-primary bg-transparent",
							)}
						>
							<Text
								className={cn(
									"font-semibold text-sm",
									activeTab === "recorded" ? "text-white" : "text-primary",
								)}
							>
								RECORDED
							</Text>
						</Pressable>
						<Pressable
							onPress={() => {
								setActiveTab("live");
								handleLivePress();
							}}
							className={cn(
								"rounded-full px-6 py-3",
								activeTab === "live"
									? "bg-primary"
									: "border border-primary bg-transparent",
							)}
						>
							<Text
								className={cn(
									"font-semibold text-sm",
									activeTab === "live" ? "text-white" : "text-primary",
								)}
							>
								LIVE
							</Text>
						</Pressable>
					</View>

					{/* Subjects Grid */}
					{activeTab === "recorded" && (
						<View className="flex-row flex-wrap justify-center">
							{subjects.map((subject) => (
								<SubjectCard
									key={subject.id}
									title={subject.title}
									videoCount={subject.videoCount}
									pdfCount={subject.pdfCount}
									onPress={() => handleSubjectPress(subject.id)}
								/>
							))}
						</View>
					)}
				</Animated.View>
			</ScrollView>

			{/* Bottom Navigation */}
			<BottomNavigation currentRoute="batches" onNavigate={handleNavigation} />
		</View>
	);
}
