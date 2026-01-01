import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { cn } from "heroui-native";
import { useState } from "react";
import {
	Image,
	Linking,
	Pressable,
	ScrollView,
	Text,
	View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Mock data for batch details
const batchData = {
	id: "1",
	title: "TITAN 2.O Batch For Navodaya Vidyalaya 2026",
	description:
		"TITAN 2.0 Batch for Navodaya Vidyalaya 2026 is a comprehensive live course designed to help students excel in the JNVST 2026 ....",
	banner: {
		uri: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800",
	},
	educators: ["Nadim", "Meraj Nadim", "Hammad Ashhar"],
	startDate: "14 April 2025",
	subjects: ["Mathematics", "Science", "English", "Hindi"],
	language: "Hinglish",
	highlights: [
		"Live Classes",
		"Recorded Classes",
		"Doubt Classes",
		"Mentorship",
	],
	price: 5999,
	originalPrice: 7999,
};

const educatorsData = [
	{
		id: "1",
		name: "Mahtab Nadim",
		image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
		description:
			"B-Tech 4+ Years Of Experience , 5000+ JNV Aspirant, Experienced in personalized coaching and on...........",
	},
	{
		id: "2",
		name: "Meraz Nadim",
		image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
		description:
			"B-Tech 4+ Years Of Experience , 5000+ JNV Aspirant, Experienced in personalized coaching and on...........",
	},
	{
		id: "3",
		name: "Hammad Ashhar",
		image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
		description:
			"B-Tech 4+ Years Of Experience , 5000+ JNV Aspirant, Experienced in personalized coaching and on...........",
	},
	{
		id: "4",
		name: "Asif Equebal",
		image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
		description:
			"B-Tech 4+ Years Of Experience , 5000+ JNV Aspirant, Experienced in personalized coaching and on...........",
	},
];

const faqData = [
	{
		id: "1",
		question: "Why Should I enroll in this course and how will it benefit me ?",
	},
	{
		id: "2",
		question: "How will the classes be delivered ? What if I miss a class ?",
	},
	{
		id: "3",
		question: "Will i have access to class recording ?",
	},
	{
		id: "4",
		question: "Will I receive class notes and assignments ?",
	},
	{
		id: "5",
		question: "What are the class days and timing ?",
	},
];

type TabType = "about" | "educators" | "faqs";

export default function BatchDetail() {
	const insets = useSafeAreaInsets();
	const { id } = useLocalSearchParams<{ id: string }>();
	const [activeTab, setActiveTab] = useState<TabType>("about");
	const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
	const [showFullDescription, setShowFullDescription] = useState(false);

	void id; // Reserved for fetching batch-specific data

	const handleCallNow = () => {
		Linking.openURL("tel:+919876543210");
	};

	const handleJoinBatch = () => {
		// Navigate to payment flow
		router.push({
			pathname: "/payment/[id]" as never,
			params: { id: batchData.id },
		});
	};

	const toggleFaq = (faqId: string) => {
		setExpandedFaq(expandedFaq === faqId ? null : faqId);
	};

	return (
		<View className="flex-1 bg-background">
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ paddingBottom: 100 }}
				showsVerticalScrollIndicator={false}
			>
				{/* Hero Banner Section */}
				<View className="relative">
					{/* Green Banner Background */}
					<View className="h-56 bg-[#22c55e]">
						{/* Header with Back and Share */}
						<View
							className="absolute right-0 left-0 z-10 flex-row items-center justify-between px-4"
							style={{ top: insets.top + 8 }}
						>
							<Pressable
								onPress={() => router.back()}
								className="flex-row items-center"
							>
								<Ionicons name="chevron-back" size={24} color="#ffffff" />
								<Text className="ml-1 font-medium text-lg text-white">
									Back
								</Text>
							</Pressable>
							<Pressable className="p-2">
								<Ionicons
									name="share-social-outline"
									size={24}
									color="#ffffff"
								/>
							</Pressable>
						</View>

						{/* Banner Image - Educators */}
						<View className="absolute right-0 bottom-0 left-0 items-center justify-center">
							<Image
								source={batchData.banner}
								style={{ width: "80%", height: 140 }}
								resizeMode="contain"
							/>
						</View>
					</View>
				</View>

				{/* Content Section */}
				<View className="px-4 pt-6">
					{/* Title and Description */}
					<Animated.View entering={FadeInDown.delay(100)}>
						<Text className="mb-2 font-bold text-foreground text-xl">
							{batchData.title}
						</Text>
						<Text className="text-muted-foreground text-sm leading-5">
							{showFullDescription
								? batchData.description
								: `${batchData.description.substring(0, 120)}....`}
							<Text
								className="font-semibold text-primary"
								onPress={() => setShowFullDescription(!showFullDescription)}
							>
								{showFullDescription ? " Show Less" : "Read More"}
							</Text>
						</Text>
					</Animated.View>

					{/* Tab Navigation */}
					<Animated.View
						entering={FadeInDown.delay(200)}
						className="mt-6 flex-row border-border border-b"
					>
						{(["about", "educators", "faqs"] as TabType[]).map((tab) => (
							<Pressable
								key={tab}
								onPress={() => setActiveTab(tab)}
								className={cn(
									"mr-6 pb-3",
									activeTab === tab && "border-foreground border-b-2",
								)}
							>
								<Text
									className={cn(
										"text-base capitalize",
										activeTab === tab
											? "font-semibold text-foreground"
											: "text-muted-foreground",
									)}
								>
									{tab === "faqs"
										? "FAQs"
										: tab.charAt(0).toUpperCase() + tab.slice(1)}
								</Text>
							</Pressable>
						))}
					</Animated.View>

					{/* Tab Content */}
					{activeTab === "about" && (
						<Animated.View entering={FadeInDown.delay(300)} className="mt-6">
							{/* About The Course */}
							<Text className="mb-4 font-semibold text-foreground text-lg">
								About The Course
							</Text>

							{/* Course Details List */}
							<View className="gap-4">
								{/* Educators */}
								<View className="flex-row items-start">
									<View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100">
										<Ionicons name="people-outline" size={20} color="#64748b" />
									</View>
									<View className="flex-1">
										<Text className="text-muted-foreground text-sm">
											Educators
										</Text>
										<Text className="font-medium text-foreground text-sm">
											{batchData.educators.join(", ")}
										</Text>
									</View>
								</View>

								{/* Batch Start Date */}
								<View className="flex-row items-start">
									<View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100">
										<Ionicons
											name="calendar-outline"
											size={20}
											color="#64748b"
										/>
									</View>
									<View className="flex-1">
										<Text className="text-muted-foreground text-sm">
											Batch Start Date
										</Text>
										<Text className="font-medium text-foreground text-sm">
											{batchData.startDate}
										</Text>
									</View>
								</View>

								{/* Subject Covered */}
								<View className="flex-row items-start">
									<View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100">
										<Ionicons name="book-outline" size={20} color="#64748b" />
									</View>
									<View className="flex-1">
										<Text className="text-muted-foreground text-sm">
											Subject Covered
										</Text>
										<Text className="font-medium text-foreground text-sm">
											{batchData.subjects.join(", ")}
										</Text>
									</View>
								</View>

								{/* Language */}
								<View className="flex-row items-start">
									<View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100">
										<MaterialCommunityIcons
											name="translate"
											size={20}
											color="#64748b"
										/>
									</View>
									<View className="flex-1">
										<Text className="text-muted-foreground text-sm">
											Language
										</Text>
										<Text className="font-medium text-foreground text-sm">
											{batchData.language}
										</Text>
									</View>
								</View>

								{/* Course Highlights */}
								<View className="flex-row items-start">
									<View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
										<Ionicons name="star" size={20} color="#eab308" />
									</View>
									<View className="flex-1">
										<Text className="text-muted-foreground text-sm">
											Course Highlights
										</Text>
										<Text className="font-medium text-foreground text-sm">
											{batchData.highlights.join(", ")}
										</Text>
									</View>
								</View>
							</View>

							{/* Download Syllabus Button */}
							<Pressable className="mt-6 flex-row items-center justify-center rounded-full border border-gray-300 py-3">
								<Ionicons
									name="cloud-download-outline"
									size={20}
									color="#0f172a"
								/>
								<Text className="ml-2 font-medium text-foreground">
									Download Syllabus
								</Text>
							</Pressable>

							{/* Divider */}
							<View className="my-6 h-px bg-gray-200" />

							{/* About The Educator */}
							<Text className="mb-4 font-semibold text-foreground text-lg">
								About The Educator
							</Text>

							{/* Educators List */}
							<View className="gap-4">
								{educatorsData.map((educator) => (
									<View key={educator.id} className="flex-row items-start">
										<Image
											source={{ uri: educator.image }}
											className="mr-3 h-14 w-14 rounded-full bg-gray-200"
										/>
										<View className="flex-1">
											<Text className="font-semibold text-base text-foreground">
												{educator.name}
											</Text>
											<Text className="mt-1 text-muted-foreground text-xs leading-4">
												{educator.description}
											</Text>
										</View>
									</View>
								))}
							</View>

							{/* Divider */}
							<View className="my-6 h-px bg-gray-200" />

							{/* Frequently Asked Question */}
							<Text className="mb-4 font-semibold text-foreground text-lg">
								Frequently Asked Question
							</Text>

							{/* FAQ List */}
							<View className="gap-2">
								{faqData.map((faq) => (
									<Pressable
										key={faq.id}
										onPress={() => toggleFaq(faq.id)}
										className="flex-row items-center justify-between border-border border-b py-3"
									>
										<Text className="flex-1 pr-4 text-foreground text-sm">
											{faq.question}
										</Text>
										<Ionicons
											name={
												expandedFaq === faq.id ? "chevron-up" : "chevron-down"
											}
											size={20}
											color="#64748b"
										/>
									</Pressable>
								))}
							</View>

							{/* Divider */}
							<View className="my-6 h-px bg-gray-200" />

							{/* Contact Admission Banner */}
							<View className="overflow-hidden rounded-2xl bg-gray-100 p-4">
								<View className="flex-row items-center justify-between">
									<View className="flex-1">
										<Text className="text-muted-foreground text-sm">
											Still have any queries ?
										</Text>
										<Text className="mt-1 font-bold text-foreground text-xl">
											Contact our admission{"\n"}department
										</Text>
										<Pressable
											onPress={handleCallNow}
											className="mt-3 flex-row items-center self-start rounded-full bg-white px-4 py-2 shadow-sm"
										>
											<Ionicons name="call" size={16} color="#0f172a" />
											<Text className="ml-2 font-medium text-foreground text-sm">
												Call Now
											</Text>
										</Pressable>
									</View>
									<Image
										source={{
											uri: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200",
										}}
										className="h-24 w-24"
										resizeMode="contain"
									/>
								</View>
							</View>

							{/* Refund Policy */}
							<Pressable className="mt-4 flex-row items-center justify-between rounded-2xl border border-gray-200 px-4 py-4">
								<View className="flex-row items-center">
									<View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-gray-100">
										<MaterialCommunityIcons
											name="currency-usd"
											size={18}
											color="#0f172a"
										/>
									</View>
									<Text className="font-medium text-foreground">
										Refund Policy
									</Text>
								</View>
								<Ionicons name="chevron-forward" size={20} color="#64748b" />
							</Pressable>
						</Animated.View>
					)}

					{activeTab === "educators" && (
						<Animated.View entering={FadeInDown.delay(300)} className="mt-6">
							<Text className="mb-4 font-semibold text-foreground text-lg">
								Our Educators
							</Text>
							<View className="gap-4">
								{educatorsData.map((educator) => (
									<View
										key={educator.id}
										className="flex-row items-start rounded-xl bg-secondary p-4"
									>
										<Image
											source={{ uri: educator.image }}
											className="mr-3 h-16 w-16 rounded-full bg-gray-200"
										/>
										<View className="flex-1">
											<Text className="font-semibold text-base text-foreground">
												{educator.name}
											</Text>
											<Text className="mt-1 text-muted-foreground text-xs leading-4">
												{educator.description}
											</Text>
										</View>
									</View>
								))}
							</View>
						</Animated.View>
					)}

					{activeTab === "faqs" && (
						<Animated.View entering={FadeInDown.delay(300)} className="mt-6">
							<Text className="mb-4 font-semibold text-foreground text-lg">
								Frequently Asked Questions
							</Text>
							<View className="gap-2">
								{faqData.map((faq) => (
									<Pressable
										key={faq.id}
										onPress={() => toggleFaq(faq.id)}
										className="rounded-xl bg-secondary p-4"
									>
										<View className="flex-row items-center justify-between">
											<Text className="flex-1 pr-4 font-medium text-foreground text-sm">
												{faq.question}
											</Text>
											<Ionicons
												name={
													expandedFaq === faq.id ? "chevron-up" : "chevron-down"
												}
												size={20}
												color="#64748b"
											/>
										</View>
										{expandedFaq === faq.id && (
											<Text className="mt-2 text-muted-foreground text-sm">
												Lorem ipsum dolor sit amet, consectetur adipiscing elit.
												Sed do eiusmod tempor incididunt ut labore et dolore
												magna aliqua.
											</Text>
										)}
									</Pressable>
								))}
							</View>
						</Animated.View>
					)}
				</View>
			</ScrollView>

			{/* Sticky Footer */}
			<View
				className="absolute right-0 bottom-0 left-0 flex-row items-center justify-between border-border border-t bg-white px-4 py-3"
				style={{ paddingBottom: insets.bottom + 12 }}
			>
				<View>
					<Text className="text-muted-foreground text-xs uppercase">
						Annual Fee
					</Text>
					<Text className="font-bold text-foreground text-xl">
						₹{batchData.price.toLocaleString()}
					</Text>
				</View>
				<Pressable
					onPress={handleJoinBatch}
					className="rounded-full bg-[#22c55e] px-8 py-3"
				>
					<Text className="font-semibold text-white">Join This Batch</Text>
				</Pressable>
			</View>
		</View>
	);
}
