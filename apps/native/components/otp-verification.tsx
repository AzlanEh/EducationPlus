import { useLocalSearchParams, useRouter } from "expo-router";
import { Card, useThemeColor } from "heroui-native";
import { useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Pressable,
	Text,
	TextInput,
	View,
} from "react-native";
import { client } from "@/utils/orpc";

export function OTPVerification() {
	const [otp, setOtp] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const { email } = useLocalSearchParams<{ email: string }>();
	const router = useRouter();

	const mutedColor = useThemeColor("muted");
	const foregroundColor = useThemeColor("foreground");

	async function handleVerifyOTP() {
		if (!otp) {
			setError("Please enter the OTP");
			return;
		}

		if (!email) {
			setError("Email is required");
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const result = await (client as any).v1.auth.verifyOTP({ email, otp });
			if (!result.success) {
				throw new Error(result.error || "Invalid OTP");
			}

			Alert.alert("Success", "Email verified! You can now sign in.", [
				{
					text: "OK",
					onPress: () => router.replace("sign-in" as any),
				},
			]);
		} catch (err: unknown) {
			const error = err as { message?: string };
			setError(error?.message || "Invalid OTP");
		} finally {
			setIsLoading(false);
		}
	}

	async function handleResendOTP() {
		if (!email) return;

		setIsLoading(true);
		setError(null);

		try {
			await (client as any).v1.auth.sendOTP({ email });
			Alert.alert("Success", "OTP sent to your email");
		} catch (err: unknown) {
			const error = err as { message?: string };
			setError(error?.message || "Failed to resend OTP");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<Card variant="secondary" className="mt-6 p-4">
			<Card.Title className="mb-4">Verify Your Email</Card.Title>

			{error && (
				<View className="mb-4 rounded-lg bg-red-100 p-3">
					<Text className="text-red-600 text-sm">{error}</Text>
				</View>
			)}

			<Text className="mb-4 text-center text-muted-foreground">
				We've sent a verification code to {email}
			</Text>

			<TextInput
				className="mb-4 rounded-lg border border-divider bg-surface px-4 py-3 text-center text-foreground text-xl tracking-widest"
				placeholder="000000"
				value={otp}
				onChangeText={setOtp}
				placeholderTextColor={mutedColor}
				keyboardType="numeric"
				maxLength={6}
			/>

			<Pressable
				onPress={handleVerifyOTP}
				disabled={isLoading}
				className="mb-3 flex-row items-center justify-center rounded-lg bg-accent p-4 active:opacity-70"
			>
				{isLoading ? (
					<ActivityIndicator size="small" color={foregroundColor} />
				) : (
					<Text className="font-medium text-foreground">Verify Email</Text>
				)}
			</Pressable>

			<Pressable
				onPress={handleResendOTP}
				disabled={isLoading}
				className="mb-3 p-2"
			>
				<Text className="text-center text-accent">Resend OTP</Text>
			</Pressable>

			<Pressable onPress={() => router.back()} className="p-2">
				<Text className="text-center text-muted-foreground">
					Back to Sign Up
				</Text>
			</Pressable>
		</Card>
	);
}
