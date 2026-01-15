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
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/utils/orpc";

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
		return {
			strength: "weak",
			score,
			label: "Weak",
			color: "var(--destructive)",
		};
	}
	if (score <= 3) {
		return {
			strength: "medium",
			score,
			label: "Medium",
			color: "var(--chart-4)",
		};
	}
	return {
		strength: "strong",
		score,
		label: "Strong",
		color: "var(--chart-1)",
	};
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
							backgroundColor: i <= score ? color : "var(--border)",
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
	const params = useLocalSearchParams<{
		type?: string;
		email?: string;
		name?: string;
		target?: string;
		gender?: string;
		phoneNumber?: string;
	}>();
	const { showToast } = useToast();

	const isReset = params.type === "reset-password";

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [errors, setErrors] = useState({
		password: "",
		confirmPassword: "",
		general: "",
	});

	const validateForm = (): boolean => {
		const newErrors = { password: "", confirmPassword: "", general: "" };
		let isValid = true;

		if (!password) {
			newErrors.password = "Password is required";
			isValid = false;
		} else if (password.length < 8) {
			newErrors.password = "Password must be at least 8 characters";
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

		if (!params.email || !params.name) {
			setErrors((prev) => ({
				...prev,
				general: "Missing user information. Please start over.",
			}));
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
			return;
		}

		setIsLoading(true);
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

		try {
			if (isReset) {
				// For password reset, use the reset password flow
				// This would need to be implemented with Better Auth's forgetPassword flow
				showToast({
					type: "error",
					title: "Not Implemented",
					message: "Password reset flow is not yet implemented",
				});
				setIsLoading(false);
				return;
			}

			// Create account with Better Auth
			await authClient.signUp.email(
				{
					email: params.email,
					password,
					name: params.name,
					// Pass additional fields
					target: params.target || "",
					gender: params.gender || "",
					phoneNo: params.phoneNumber || "",
					signupSource: "native",
				} as any, // Type assertion for additional fields
				{
					onError(error) {
						console.error("Sign up error:", error);
						setErrors((prev) => ({
							...prev,
							general: error.error?.message || "Failed to create account",
						}));
						Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
						setIsLoading(false);
					},
					onSuccess() {
						Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
						queryClient.refetchQueries();
						showToast({
							type: "success",
							title: "Account Created!",
							message: "Welcome to EduPlus! Let's start learning",
						});
						router.replace("/home");
					},
				},
			);
		} catch (err: any) {
			console.error("Sign up error:", err);
			setErrors((prev) => ({
				...prev,
				general: err.message || "Something went wrong. Please try again.",
			}));
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
			setIsLoading(false);
		}
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

						{/* General Error */}
						{errors.general && (
							<Animated.View
								entering={FadeInDown.springify().damping(15)}
								className="mb-4 flex-row items-center rounded-xl bg-danger/10 p-4"
							>
								<Ionicons
									name="alert-circle"
									size={20}
									color="var(--destructive)"
								/>
								<Text className="ml-2 flex-1 text-danger">
									{errors.general}
								</Text>
							</Animated.View>
						)}

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
										met={password.length >= 8}
										text="At least 8 characters"
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
				color={met ? "var(--chart-1)" : "var(--muted)"}
			/>
			<Text
				className={`ml-2 text-sm ${met ? "text-foreground" : "text-muted-foreground"}`}
			>
				{text}
			</Text>
		</View>
	);
}
