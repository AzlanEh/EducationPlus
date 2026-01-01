import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	Text,
	View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Input, useToast } from "@/components/ui";

export default function ForgotPassword() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { showToast } = useToast();
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [emailError, setEmailError] = useState("");

	const validateEmail = (value: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!value) {
			return "Email is required";
		}
		if (!emailRegex.test(value)) {
			return "Please enter a valid email address";
		}
		return "";
	};

	const handleEmailChange = (value: string) => {
		setEmail(value);
		if (emailError) {
			setEmailError(validateEmail(value));
		}
	};

	const handleSubmit = async () => {
		const error = validateEmail(email);
		if (error) {
			setEmailError(error);
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
			return;
		}

		setIsLoading(true);
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 2000));

		setIsLoading(false);

		showToast({
			type: "success",
			title: "OTP Sent!",
			message: `We've sent a verification code to ${email}`,
		});

		// Navigate to OTP verification with reset context
		router.push({
			pathname: "/otp-verification",
			params: { email, type: "reset-password" },
		});
	};

	return (
		<View className="flex-1 bg-background">
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				className="flex-1"
			>
				<ScrollView
					className="flex-1"
					contentContainerStyle={{
						flexGrow: 1,
						paddingTop: insets.top,
						paddingBottom: insets.bottom + 20,
					}}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
				>
					{/* Header */}
					<Animated.View
						entering={FadeInUp.springify().damping(15)}
						className="flex-row items-center px-5 py-4"
					>
						<Pressable
							onPress={() => {
								Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
								router.back();
							}}
							className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-secondary"
						>
							<Ionicons name="arrow-back" size={20} color="var(--foreground)" />
						</Pressable>
						<Text className="font-bold text-foreground text-xl">
							Forgot Password
						</Text>
					</Animated.View>

					{/* Content */}
					<View className="flex-1 px-6">
						{/* Illustration */}
						<Animated.View
							entering={FadeInDown.delay(100).springify().damping(15)}
							className="mb-8 items-center"
						>
							<View className="mb-6 h-32 w-32 items-center justify-center rounded-full bg-primary/10">
								<Ionicons name="lock-closed" size={64} color="var(--primary)" />
							</View>
							<Text className="mb-2 text-center font-bold text-2xl text-foreground">
								Reset Your Password
							</Text>
							<Text className="px-6 text-center text-muted-foreground">
								Enter your email address and we'll send you a verification code
								to reset your password.
							</Text>
						</Animated.View>

						{/* Form */}
						<Animated.View
							entering={FadeInDown.delay(200).springify().damping(15)}
							className="gap-4"
						>
							<Input
								label="Email Address"
								placeholder="Enter your email"
								value={email}
								onChangeText={handleEmailChange}
								keyboardType="email-address"
								autoCapitalize="none"
								autoComplete="email"
								error={emailError}
								leftIcon="mail-outline"
							/>

							<Button
								onPress={handleSubmit}
								isLoading={isLoading}
								size="lg"
								className="mt-4"
							>
								Send Verification Code
							</Button>
						</Animated.View>

						{/* Back to sign in */}
						<Animated.View
							entering={FadeInDown.delay(300).springify().damping(15)}
							className="mt-8 flex-row items-center justify-center"
						>
							<Text className="text-muted-foreground">
								Remember your password?{" "}
							</Text>
							<Pressable
								onPress={() => {
									Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
									router.push("/sign_in");
								}}
							>
								<Text className="font-semibold text-primary">Sign In</Text>
							</Pressable>
						</Animated.View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</View>
	);
}
