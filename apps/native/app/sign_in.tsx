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
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/utils/orpc";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function SignInScreen() {
	const insets = useSafeAreaInsets();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [emailError, setEmailError] = useState<string | null>(null);
	const [passwordError, setPasswordError] = useState<string | null>(null);

	// Animation for back button
	const backButtonScale = useSharedValue(1);
	const backButtonAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: backButtonScale.value }],
	}));

	const validateEmail = (value: string) => {
		if (!value.trim()) {
			setEmailError("Email is required");
			return false;
		}
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(value)) {
			setEmailError("Please enter a valid email");
			return false;
		}
		setEmailError(null);
		return true;
	};

	const validatePassword = (value: string) => {
		if (!value.trim()) {
			setPasswordError("Password is required");
			return false;
		}
		if (value.length < 6) {
			setPasswordError("Password must be at least 6 characters");
			return false;
		}
		setPasswordError(null);
		return true;
	};

	async function handleLogin() {
		const isEmailValid = validateEmail(email);
		const isPasswordValid = validatePassword(password);

		if (!isEmailValid || !isPasswordValid) {
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
			return;
		}

		setIsLoading(true);
		setError(null);

		await authClient.signIn.email(
			{
				email,
				password,
			},
			{
				onError(error) {
					setError(error.error?.message || "Failed to sign in");
					Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
					setIsLoading(false);
				},
				onSuccess() {
					setEmail("");
					setPassword("");
					Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
					queryClient.refetchQueries();
					router.replace("/home" as never);
				},
				onFinished() {
					setIsLoading(false);
				},
			},
		);
	}

	const handleBackPress = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		router.back();
	};

	return (
		<View
			className="flex-1 bg-surface"
			style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
		>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				className="flex-1"
			>
				{/* Main Content Card */}
				<Animated.View
					entering={FadeIn.duration(300)}
					className="m-4 flex-1 rounded-3xl bg-card shadow-lg"
				>
					<ScrollView
						contentContainerStyle={{ flexGrow: 1, padding: 24 }}
						showsVerticalScrollIndicator={false}
						keyboardShouldPersistTaps="handled"
					>
						{/* Back Button */}
						<AnimatedPressable
							style={backButtonAnimatedStyle}
							onPress={handleBackPress}
							onPressIn={() => {
								backButtonScale.value = withSpring(0.95);
							}}
							onPressOut={() => {
								backButtonScale.value = withSpring(1);
							}}
							className="mb-6 flex-row items-center self-start rounded-lg p-1"
							accessibilityLabel="Go back"
							accessibilityRole="button"
						>
							<Ionicons
								name="chevron-back"
								size={24}
								color="var(--foreground)"
							/>
							<Text className="ml-1 font-medium text-foreground text-lg">
								Back
							</Text>
						</AnimatedPressable>

						{/* Title */}
						<Animated.View entering={FadeInDown.delay(100).duration(400)}>
							<Text className="mb-2 font-bold text-2xl text-foreground">
								Welcome Back!
							</Text>
							<Text className="mb-8 text-muted-foreground">
								Log in to continue your learning journey
							</Text>
						</Animated.View>

						{/* Error Message */}
						{error && (
							<Animated.View
								entering={FadeIn.duration(200)}
								className="mb-4 flex-row items-center rounded-xl bg-danger/10 p-4"
							>
								<Ionicons name="alert-circle" size={20} color="var(--danger)" />
								<Text className="ml-2 flex-1 text-danger">{error}</Text>
							</Animated.View>
						)}

						{/* Email Input */}
						<Animated.View entering={FadeInUp.delay(200).duration(400)}>
							<Input
								label="Email Address"
								value={email}
								onChangeText={(text) => {
									setEmail(text);
									if (emailError) validateEmail(text);
								}}
								onBlur={() => validateEmail(email)}
								placeholder="Enter your email"
								keyboardType="email-address"
								autoCapitalize="none"
								autoCorrect={false}
								leftIcon="mail-outline"
								error={emailError || undefined}
								showSuccessState={!!email && !emailError}
							/>
						</Animated.View>

						{/* Password Input */}
						<Animated.View entering={FadeInUp.delay(300).duration(400)}>
							<Input
								label="Password"
								value={password}
								onChangeText={(text) => {
									setPassword(text);
									if (passwordError) validatePassword(text);
								}}
								onBlur={() => validatePassword(password)}
								placeholder="Enter your password"
								isPassword
								leftIcon="lock-closed-outline"
								error={passwordError || undefined}
							/>
						</Animated.View>

						{/* Forgot Password */}
						<Animated.View entering={FadeInUp.delay(400).duration(400)}>
							<Pressable
								onPress={() => {
									Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
									router.push("/forgot-password");
								}}
								className="mb-8 self-end"
								accessibilityLabel="Forgot password"
								accessibilityRole="button"
							>
								<Text className="font-medium text-primary">
									Forgot Password?
								</Text>
							</Pressable>
						</Animated.View>

						{/* Login Button */}
						<Animated.View entering={FadeInUp.delay(500).duration(400)}>
							<Button
								onPress={handleLogin}
								isLoading={isLoading}
								fullWidth
								size="lg"
								leftIcon={!isLoading ? "log-in-outline" : undefined}
							>
								Log In
							</Button>
						</Animated.View>

						{/* Divider */}
						<Animated.View
							entering={FadeInUp.delay(600).duration(400)}
							className="my-6 flex-row items-center"
						>
							<View className="h-px flex-1 bg-border" />
							<Text className="mx-4 text-muted-foreground">
								or continue with
							</Text>
							<View className="h-px flex-1 bg-border" />
						</Animated.View>

						{/* Google Sign In */}
						<Animated.View entering={FadeInUp.delay(700).duration(400)}>
							<View className="overflow-hidden rounded-xl border border-border">
								<GoogleSignInButton>
									<Image
										source={{
											uri: "https://www.google.com/favicon.ico",
										}}
										className="mr-3 h-5 w-5"
									/>
									<Text className="font-medium text-foreground">
										Continue with Google
									</Text>
								</GoogleSignInButton>
							</View>
						</Animated.View>

						{/* Sign Up Link */}
						<Animated.View
							entering={FadeInUp.delay(800).duration(400)}
							className="mt-6 flex-row items-center justify-center"
						>
							<Text className="text-muted-foreground">
								Don't have an account?{" "}
							</Text>
							<Pressable
								onPress={() => {
									Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
									router.push("/sign_up" as never);
								}}
								accessibilityLabel="Sign up"
								accessibilityRole="button"
							>
								<Text className="font-semibold text-primary">Sign Up</Text>
							</Pressable>
						</Animated.View>
					</ScrollView>
				</Animated.View>
			</KeyboardAvoidingView>
		</View>
	);
}
