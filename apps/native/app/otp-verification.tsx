import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	Text,
	TextInput,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const OTP_LENGTH = 6;

export default function OTPVerificationScreen() {
	const insets = useSafeAreaInsets();
	const params = useLocalSearchParams<{
		phone?: string;
		email?: string;
	}>();
	// Reserved for future use with actual OTP verification
	void params;
	const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const inputRefs = useRef<(TextInput | null)[]>([]);

	const handleOtpChange = (value: string, index: number) => {
		// Only allow numbers
		if (value && !/^\d+$/.test(value)) return;

		const newOtp = [...otp];

		if (value.length > 1) {
			// Handle paste
			const pastedValues = value.slice(0, OTP_LENGTH).split("");
			for (let i = 0; i < pastedValues.length && index + i < OTP_LENGTH; i++) {
				newOtp[index + i] = pastedValues[i];
			}
			setOtp(newOtp);
			const nextIndex = Math.min(index + pastedValues.length, OTP_LENGTH - 1);
			inputRefs.current[nextIndex]?.focus();
		} else {
			newOtp[index] = value;
			setOtp(newOtp);

			// Move to next input
			if (value && index < OTP_LENGTH - 1) {
				inputRefs.current[index + 1]?.focus();
			}
		}
	};

	const handleKeyPress = (key: string, index: number) => {
		if (key === "Backspace" && !otp[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const handleVerify = async () => {
		const otpString = otp.join("");
		if (otpString.length !== OTP_LENGTH) {
			setError("Please enter complete OTP");
			return;
		}

		setIsLoading(true);
		setError(null);

		// Simulate verification
		setTimeout(() => {
			setIsLoading(false);
			router.push("/set-password" as never);
		}, 1000);
	};

	const handleResend = () => {
		// Resend OTP logic
		setOtp(Array(OTP_LENGTH).fill(""));
		inputRefs.current[0]?.focus();
	};

	return (
		<View
			className="flex-1 bg-[#e8ebe8]"
			style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
		>
			{/* Main Content Card */}
			<View className="m-4 flex-1 rounded-3xl bg-white p-6">
				{/* Back Button */}
				<Pressable
					onPress={() => router.back()}
					className="mb-8 flex-row items-center"
				>
					<Ionicons name="chevron-back" size={24} color="#0f172a" />
					<Text className="ml-1 font-medium text-foreground text-lg">Back</Text>
				</Pressable>

				{/* Title */}
				<View className="mb-8 items-center">
					<Text className="font-bold text-2xl text-foreground">
						Phone Verification
					</Text>
					<Text className="mt-2 text-muted-foreground">
						Enter your OTP code
					</Text>
				</View>

				{/* Error Message */}
				{error && (
					<View className="mb-4 rounded-lg bg-red-50 p-3">
						<Text className="text-center text-red-600 text-sm">{error}</Text>
					</View>
				)}

				{/* OTP Input Boxes */}
				<View className="mb-6 flex-row justify-center gap-2">
					{otp.map((digit, index) => (
						<TextInput
							key={`otp-${index}-${digit}`}
							ref={(ref) => {
								inputRefs.current[index] = ref;
							}}
							value={digit}
							onChangeText={(value) => handleOtpChange(value, index)}
							onKeyPress={({ nativeEvent }) =>
								handleKeyPress(nativeEvent.key, index)
							}
							keyboardType="number-pad"
							maxLength={1}
							className="h-14 w-12 rounded-lg border-2 border-gray-300 text-center text-foreground text-xl"
							style={{
								borderColor: digit ? "#22c55e" : "#d1d5db",
							}}
							selectTextOnFocus
						/>
					))}
				</View>

				{/* Resend Code */}
				<View className="mb-8 flex-row items-center justify-center">
					<Text className="text-muted-foreground">Didn't receive code ? </Text>
					<Pressable onPress={handleResend}>
						<Text className="font-medium text-[#22c55e]">Resend again</Text>
					</Pressable>
				</View>

				{/* Spacer */}
				<View className="flex-1" />

				{/* Verify Button */}
				<Pressable
					onPress={handleVerify}
					disabled={isLoading}
					className="items-center rounded-xl bg-[#1a3a2f] py-4"
				>
					{isLoading ? (
						<ActivityIndicator size="small" color="#ffffff" />
					) : (
						<Text className="font-semibold text-base text-white">Verify</Text>
					)}
				</Pressable>
			</View>
		</View>
	);
}
