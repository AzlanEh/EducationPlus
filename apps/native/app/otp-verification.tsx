import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
	FadeIn,
	FadeInDown,
	FadeInUp,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, OTPInput } from "@/components/ui";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30; // seconds

export default function OTPVerificationScreen() {
	const insets = useSafeAreaInsets();
	const params = useLocalSearchParams<{
		phone?: string;
		email?: string;
	}>();

	const [otp, setOtp] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN);
	const [canResend, setCanResend] = useState(false);

	// Animation
	const backButtonScale = useSharedValue(1);
	const backButtonAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: backButtonScale.value }],
	}));

	// Countdown timer for resend
	useEffect(() => {
		if (resendCooldown > 0) {
			const timer = setTimeout(() => {
				setResendCooldown(resendCooldown - 1);
			}, 1000);
			return () => clearTimeout(timer);
		}
		setCanResend(true);
	}, [resendCooldown]);

	const handleVerify = async (code?: string) => {
		const otpToVerify = code || otp;

		if (otpToVerify.length !== OTP_LENGTH) {
			setError("Please enter complete OTP");
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
			return;
		}

		setIsLoading(true);
		setError(null);

		// Simulate verification
		setTimeout(() => {
			setIsLoading(false);
			// Simulating success - in real app, verify with backend
			if (otpToVerify === "123456") {
				Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
				router.push("/set-password" as never);
			} else {
				setError("Invalid OTP. Please try again.");
				Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
			}
		}, 1500);
	};

	const handleOTPComplete = (code: string) => {
		handleVerify(code);
	};

	const handleResend = () => {
		if (!canResend) return;

		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		setOtp("");
		setError(null);
		setResendCooldown(RESEND_COOLDOWN);
		setCanResend(false);

		// Show success feedback
		Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
	};

	const handleBackPress = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		router.back();
	};

	// Format phone for display
	const maskedPhone = params.phone
		? `+91 ${params.phone.slice(0, 2)}****${params.phone.slice(-2)}`
		: "your phone";

	return (
		<View
			className="flex-1 bg-surface"
			style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
		>
			{/* Main Content Card */}
			<Animated.View
				entering={FadeIn.duration(300)}
				className="m-4 flex-1 rounded-3xl bg-card p-6 shadow-lg"
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
					className="mb-8 flex-row items-center self-start rounded-lg p-1"
					accessibilityLabel="Go back"
					accessibilityRole="button"
				>
					<Ionicons name="chevron-back" size={24} color="var(--foreground)" />
					<Text className="ml-1 font-medium text-foreground text-lg">Back</Text>
				</AnimatedPressable>

				{/* Header Icon */}
				<Animated.View
					entering={FadeInDown.delay(100).duration(400)}
					className="mb-6 items-center"
				>
					<View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-primary/10">
						<Ionicons
							name="shield-checkmark"
							size={40}
							color="var(--primary)"
						/>
					</View>
					<Text className="font-bold text-2xl text-foreground">
						Verify Your Phone
					</Text>
					<Text className="mt-2 text-center text-muted-foreground">
						We've sent a 6-digit code to{"\n"}
						<Text className="font-medium text-foreground">{maskedPhone}</Text>
					</Text>
				</Animated.View>

				{/* OTP Input */}
				<Animated.View entering={FadeInUp.delay(200).duration(400)}>
					<OTPInput
						length={OTP_LENGTH}
						value={otp}
						onChange={(value) => {
							setOtp(value);
							if (error) setError(null);
						}}
						onComplete={handleOTPComplete}
						error={error || undefined}
						disabled={isLoading}
					/>
				</Animated.View>

				{/* Resend Code */}
				<Animated.View
					entering={FadeInUp.delay(300).duration(400)}
					className="mt-6 flex-row items-center justify-center"
				>
					<Text className="text-muted-foreground">Didn't receive code? </Text>
					{canResend ? (
						<Pressable
							onPress={handleResend}
							accessibilityLabel="Resend OTP"
							accessibilityRole="button"
						>
							<Text className="font-semibold text-primary">Resend Code</Text>
						</Pressable>
					) : (
						<Text className="font-medium text-muted-foreground">
							Resend in {resendCooldown}s
						</Text>
					)}
				</Animated.View>

				{/* Help Text */}
				<Animated.View
					entering={FadeInUp.delay(400).duration(400)}
					className="mt-4 items-center"
				>
					<Pressable
						onPress={() => {
							Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
							// Navigate to help/support
						}}
						className="flex-row items-center"
						accessibilityLabel="Get help"
						accessibilityRole="button"
					>
						<Ionicons
							name="help-circle-outline"
							size={18}
							color="var(--muted-foreground)"
						/>
						<Text className="ml-1 text-muted-foreground text-sm">
							Need help? Contact Support
						</Text>
					</Pressable>
				</Animated.View>

				{/* Spacer */}
				<View className="flex-1" />

				{/* Verify Button */}
				<Animated.View entering={FadeInUp.delay(500).duration(400)}>
					<Button
						onPress={() => handleVerify()}
						isLoading={isLoading}
						disabled={otp.length !== OTP_LENGTH}
						fullWidth
						size="lg"
						leftIcon={!isLoading ? "checkmark-circle-outline" : undefined}
					>
						Verify & Continue
					</Button>
				</Animated.View>

				{/* Security Note */}
				<Animated.View
					entering={FadeInUp.delay(600).duration(400)}
					className="mt-4 flex-row items-center justify-center"
				>
					<Ionicons
						name="lock-closed"
						size={14}
						color="var(--muted-foreground)"
					/>
					<Text className="ml-1 text-center text-muted-foreground text-xs">
						Your information is secure and encrypted
					</Text>
				</Animated.View>
			</Animated.View>
		</View>
	);
}
