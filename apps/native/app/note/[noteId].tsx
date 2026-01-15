import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Skeleton, SkeletonText } from "@/components/ui";
import { client } from "@/utils/orpc";

export default function NoteViewer() {
	const { noteId, courseId } = useLocalSearchParams<{
		noteId: string;
		courseId?: string;
	}>();
	const insets = useSafeAreaInsets();

	// Fetch note details
	const { data: noteData, isLoading } = useQuery({
		queryKey: ["note", noteId],
		queryFn: () => (client as any).v1.student.getNote({ id: noteId }),
		enabled: !!noteId,
	});

	const handleOpenPDF = () => {
		if (noteData?.note?.fileUrl) {
			Linking.openURL(noteData.note.fileUrl);
		}
	};

	if (isLoading) {
		return (
			<View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
				<View className="flex-row items-center border-border border-b px-4 py-4">
					<Skeleton className="h-10 w-10 rounded-full" />
					<SkeletonText className="ml-4 flex-1" />
				</View>
				<View className="p-4">
					<Skeleton className="mb-4 h-8 w-3/4" />
					<SkeletonText lines={5} />
				</View>
			</View>
		);
	}

	if (!noteData?.note) {
		return (
			<View
				className="flex-1 items-center justify-center bg-background"
				style={{ paddingTop: insets.top }}
			>
				<Ionicons name="document-text-outline" size={64} color="var(--muted)" />
				<Text className="mt-4 font-medium text-foreground text-lg">
					Note not found
				</Text>
				<Pressable
					onPress={() => router.back()}
					className="mt-4 rounded-xl bg-primary px-6 py-3"
				>
					<Text className="font-medium text-white">Go Back</Text>
				</Pressable>
			</View>
		);
	}

	const note = noteData.note;

	return (
		<View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
			{/* Header */}
			<Animated.View
				entering={FadeIn.duration(400)}
				className="flex-row items-center border-border border-b px-4 py-4"
			>
				<Pressable
					onPress={() => router.back()}
					className="h-10 w-10 items-center justify-center rounded-full bg-card"
				>
					<Ionicons name="arrow-back" size={20} color="var(--foreground)" />
				</Pressable>
				<Text
					className="ml-4 flex-1 font-bold text-foreground text-lg"
					numberOfLines={1}
				>
					{note.title}
				</Text>
				{note.fileUrl && (
					<Pressable
						onPress={handleOpenPDF}
						className="h-10 w-10 items-center justify-center rounded-full bg-primary/10"
					>
						<Ionicons
							name="download-outline"
							size={20}
							color="var(--primary)"
						/>
					</Pressable>
				)}
			</Animated.View>

			<ScrollView
				className="flex-1"
				contentContainerStyle={{ padding: 16 }}
				showsVerticalScrollIndicator={false}
			>
				{/* Note Meta */}
				<Animated.View
					entering={FadeInDown.delay(100).duration(400)}
					className="mb-6"
				>
					<View className="flex-row items-center gap-3">
						<View className="h-12 w-12 items-center justify-center rounded-xl bg-danger/10">
							<Ionicons
								name="document-text"
								size={24}
								color="var(--destructive)"
							/>
						</View>
						<View className="flex-1">
							<Text className="font-bold text-foreground text-xl">
								{note.title}
							</Text>
							<Text className="text-muted-foreground text-sm">
								{new Date(note.createdAt || Date.now()).toLocaleDateString()}
							</Text>
						</View>
					</View>
				</Animated.View>

				{/* PDF Preview Button */}
				{note.fileUrl && (
					<Animated.View
						entering={FadeInDown.delay(200).duration(400)}
						className="mb-6"
					>
						<Pressable
							onPress={handleOpenPDF}
							className="flex-row items-center justify-between rounded-xl border border-border bg-card p-4"
						>
							<View className="flex-row items-center">
								<View className="mr-3 h-12 w-12 items-center justify-center rounded-lg bg-danger">
									<Text className="font-bold text-white">PDF</Text>
								</View>
								<View>
									<Text className="font-medium text-foreground">
										View PDF Document
									</Text>
									<Text className="text-muted-foreground text-xs">
										Tap to open in external viewer
									</Text>
								</View>
							</View>
							<Ionicons name="open-outline" size={24} color="var(--primary)" />
						</Pressable>
					</Animated.View>
				)}

				{/* Note Content */}
				<Animated.View entering={FadeInDown.delay(300).duration(400)}>
					<Text className="mb-3 font-semibold text-foreground text-lg">
						Content
					</Text>
					<View className="rounded-xl border border-border bg-card p-4">
						<Text className="text-foreground leading-relaxed">
							{note.content || "No content available"}
						</Text>
					</View>
				</Animated.View>
			</ScrollView>
		</View>
	);
}
