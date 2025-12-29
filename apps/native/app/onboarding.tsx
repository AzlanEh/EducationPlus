import { router } from "expo-router";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Container } from "@/components/container";

export default function Onboarding() {
	const steps = [
		{
			title: "Education Plus",
			subtitle: "Learn, track, and grow with curated courses",
		},
		{
			title: "Track Progress",
			subtitle: "See your completion and keep momentum",
		},
		{ title: "Stay Motivated", subtitle: "Clear goals and beautiful UI" },
	];
	const [index, setIndex] = React.useState(0);

	return (
		<Container className="p-6">
			<Animated.View
				entering={FadeInDown}
				className="flex-1 items-center justify-center"
			>
				<Image
					source={require("@/assets/images/react-logo.png")}
					className="mb-8 h-28 w-28"
				/>
				<Text className="mb-3 text-center font-extrabold text-4xl text-foreground">
					{steps[index].title}
				</Text>
				<Text className="mb-10 text-center text-muted text-sm">
					{steps[index].subtitle}
				</Text>
				<View className="mb-6 flex-row">
					{steps.map((s, i) => (
						<View
							key={s.title}
							className={
								i === index
									? "mx-1 h-2 w-6 rounded-full bg-primary"
									: "mx-1 h-2 w-2 rounded-full bg-muted"
							}
						/>
					))}
				</View>
				{index < steps.length - 1 ? (
					<Pressable
						onPress={() => setIndex((i) => i + 1)}
						className="rounded-2xl bg-primary px-8 py-4 active:opacity-80"
					>
						<Text className="font-semibold text-lg text-primary-foreground">
							Next
						</Text>
					</Pressable>
				) : (
					<Pressable
						className="rounded-2xl bg-primary px-8 py-4 active:opacity-80"
						onPress={() => router.push("dashboard" as any)}
					>
						<Text className="font-semibold text-lg text-primary-foreground">
							Get Started
						</Text>
					</Pressable>
				)}
			</Animated.View>
		</Container>
	);
}
