import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import {
	Image,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	Text,
	View,
} from "react-native";
import Animated, {
	FadeIn,
	FadeInDown,
	FadeInUp,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { Button, Input } from "@/components/ui";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function SignInScreen() {
	const insets = useSafeAreaInsets();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const backScale = useSharedValue(1);
	const backStyle = useAnimatedStyle(() => ({
		transform: [{ scale: backScale.value }],
	}));

	return (
		<View
			className="flex-1 bg-background"
			style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
		>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				className="flex-1"
			>
				<Animated.View
					entering={FadeIn}
					className="m-4 flex-1 rounded-3xl bg-card shadow-lg"
				>
					<ScrollView contentContainerStyle={{ padding: 24 }}>
						{/* Back */}
						<AnimatedPressable
							style={backStyle}
							onPress={() => router.back()}
							onPressIn={() => (backScale.value = withSpring(0.95))}
							onPressOut={() => (backScale.value = withSpring(1))}
							className="mb-6 flex-row items-center"
						>
							<Ionicons
								name="chevron-back"
								size={24}
								color="var(--foreground)"
							/>
							<Text className="ml-1 text-foreground text-lg">Back</Text>
						</AnimatedPressable>

						{/* Title */}
						<Animated.View entering={FadeInDown.delay(100)}>
							<Text className="font-bold text-2xl text-card-foreground">
								Welcome Back
							</Text>
							<Text className="mt-1 text-muted-foreground">
								Log in to continue learning
							</Text>
						</Animated.View>

						{/* Error */}
						{error && (
							<View className="mt-4 flex-row rounded-xl bg-destructive/10 p-4">
								<Ionicons
									name="alert-circle"
									size={20}
									color="var(--destructive)"
								/>
								<Text className="ml-2 text-destructive">{error}</Text>
							</View>
						)}

						<Animated.View entering={FadeInUp.delay(200)}>
							<Input
								label="Email"
								value={email}
								onChangeText={setEmail}
								leftIcon="mail-outline"
							/>
						</Animated.View>

						<Animated.View entering={FadeInUp.delay(300)}>
							<Input
								label="Password"
								value={password}
								onChangeText={setPassword}
								leftIcon="lock-closed-outline"
								isPassword
							/>
						</Animated.View>

						<Animated.View entering={FadeInUp.delay(400)} className="mt-8">
							<Button
								onPress={() => {}}
								isLoading={isLoading}
								fullWidth
								size="lg"
							>
								Log In
							</Button>
						</Animated.View>

						<View className="mt-6 rounded-xl border border-border">
							<GoogleSignInButton>
								<Image
									source={{ uri: "https://www.google.com/favicon.ico" }}
									className="mr-3 h-5 w-5"
								/>
								<Text className="font-medium text-foreground">
									Continue with Google
								</Text>
							</GoogleSignInButton>
						</View>
					</ScrollView>
				</Animated.View>
			</KeyboardAvoidingView>
		</View>
	);
}
