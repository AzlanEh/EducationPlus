import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
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

type PasswordStrength = "weak" | "medium" | "strong";

function getPasswordStrength(password: string): {
	strength: PasswordStrength;
	score: number;
	label: string;
	color: string;
} {
	let score = 0;

	if (password.length >= 6) score++;
	if (password.length >= 8) score++;
	if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
	if (/[0-9]/.test(password)) score++;
	if (/[^a-zA-Z0-9]/.test(password)) score++;

	if (score <= 2) {
		return { strength: "weak", score, label: "Weak", color: "#ef4444" };
	}
	if (score <= 3) {
		return { strength: "medium", score, label: "Medium", color: "#f59e0b" };
	}
	return { strength: "strong", score, label: "Strong", color: "#22c55e" };
}

function PasswordStrengthIndicator({ password }: { password: string }) {
	const { score, label, color } = getPasswordStrength(password);

	if (!password) return null;

	return (
		<Animated.View
			entering={FadeInDown.springify().damping(15)}
			className="mt-2"
		>
			<View className="mb-1 flex-row justify-between">
				<Text className="text-muted-foreground text-xs">Password strength</Text>
				<Text className="font-medium text-xs" style={{ color }}>
					{label}
				</Text>
			</View>
			<View className="h-1 flex-row gap-1">
				{[1, 2, 3, 4, 5].map((i) => (
					<View
						key={i}
						className="flex-1 rounded-full"
						style={{
							backgroundColor: i <= score ? color : "#e5e7eb",
						}}
					/>
				))}
			</View>
		</Animated.View>
	);
}

export default function SetPasswordScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const params = useLocalSearchParams<{ type?: string; email?: string }>();
	const { showToast } = useToast();

	const isReset = params.type === "reset-password";

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [errors, setErrors] = useState({
		password: "",
		confirmPassword: "",
	});

	const validateForm = (): boolean => {
		const newErrors = { password: "", confirmPassword: "" };
		let isValid = true;

		if (!password) {
			newErrors.password = "Password is required";
			isValid = false;
		} else if (password.length < 6) {
			newErrors.password = "Password must be at least 6 characters";
			isValid = false;
		} else if (!/[0-9!@#$%^&*(),.?":{}|<>]/.test(password)) {
			newErrors.password =
				"Password must contain at least 1 number or special character";
			isValid = false;
		}

		if (!confirmPassword) {
			newErrors.confirmPassword = "Please confirm your password";
			isValid = false;
		} else if (password !== confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
			isValid = false;
		}

		setErrors(newErrors);
		return isValid;
	};

	const handleSubmit = async () => {
		if (!validateForm()) {
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
			return;
		}

		setIsLoading(true);
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 2000));

		setIsLoading(false);
		Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

		showToast({
			type: "success",
			title: isReset ? "Password Reset!" : "Account Created!",
			message: isReset
				? "Your password has been reset successfully"
				: "Welcome to EduPlus! Let's start learning",
		});

		router.replace("/home");
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
							{isReset ? "Reset Password" : "Set Password"}
						</Text>
					</Animated.View>

					{/* Content */}
					<View className="flex-1 px-6">
						{/* Illustration */}
						<Animated.View
							entering={FadeInDown.delay(100).springify().damping(15)}
							className="mb-8 items-center"
						>
							<View className="mb-6 h-28 w-28 items-center justify-center rounded-full bg-primary/10">
								<Ionicons
									name={isReset ? "key" : "shield-checkmark"}
									size={56}
									color="var(--primary)"
								/>
							</View>
							<Text className="mb-2 text-center font-bold text-2xl text-foreground">
								{isReset ? "Create New Password" : "Secure Your Account"}
							</Text>
							<Text className="px-4 text-center text-muted-foreground">
								{isReset
									? "Your new password must be different from previously used passwords"
									: "Create a strong password to protect your account"}
							</Text>
						</Animated.View>

						{/* Form */}
						<Animated.View
							entering={FadeInDown.delay(200).springify().damping(15)}
							className="gap-4"
						>
							<View>
								<Input
									label="Password"
									placeholder="Enter your password"
									value={password}
									onChangeText={(value) => {
										setPassword(value);
										if (errors.password) {
											setErrors((prev) => ({ ...prev, password: "" }));
										}
									}}
									isPassword
									autoCapitalize="none"
									error={errors.password}
									leftIcon="lock-closed-outline"
								/>
								<PasswordStrengthIndicator password={password} />
							</View>

							<Input
								label="Confirm Password"
								placeholder="Confirm your password"
								value={confirmPassword}
								onChangeText={(value) => {
									setConfirmPassword(value);
									if (errors.confirmPassword) {
										setErrors((prev) => ({ ...prev, confirmPassword: "" }));
									}
								}}
								isPassword
								autoCapitalize="none"
								error={errors.confirmPassword}
								leftIcon="lock-closed-outline"
								showSuccessState={
									!!confirmPassword && password === confirmPassword
								}
							/>

							{/* Password requirements */}
							<Animated.View
								entering={FadeInDown.delay(250).springify().damping(15)}
								className="mt-2 rounded-xl bg-secondary/50 p-4"
							>
								<Text className="mb-2 font-medium text-foreground text-sm">
									Password must contain:
								</Text>
								<View className="gap-1.5">
									<PasswordRequirement
										met={password.length >= 6}
										text="At least 6 characters"
									/>
									<PasswordRequirement
										met={/[0-9]/.test(password)}
										text="At least 1 number"
									/>
									<PasswordRequirement
										met={/[!@#$%^&*(),.?":{}|<>]/.test(password)}
										text="At least 1 special character"
									/>
								</View>
							</Animated.View>

							<Button
								onPress={handleSubmit}
								isLoading={isLoading}
								size="lg"
								className="mt-4"
							>
								{isReset ? "Reset Password" : "Create Account"}
							</Button>
						</Animated.View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</View>
	);
}

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
	return (
		<View className="flex-row items-center">
			<Ionicons
				name={met ? "checkmark-circle" : "ellipse-outline"}
				size={16}
				color={met ? "#22c55e" : "var(--muted)"}
			/>
			<Text
				className={`ml-2 text-sm ${met ? "text-foreground" : "text-muted-foreground"}`}
			>
				{text}
			</Text>
		</View>
	);
}
