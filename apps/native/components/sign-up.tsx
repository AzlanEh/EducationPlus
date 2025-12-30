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
import { authClient } from "@/lib/auth-client";
import { client } from "@/utils/orpc";

type SignUpStep = "form" | "otp";

export function SignUp() {
	const [step, setStep] = useState<SignUpStep>("form");

	// Form fields
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [target, setTarget] = useState("");
	const [gender, setGender] = useState("");
	const [phoneNo, setPhoneNo] = useState("");

	// OTP field
	const [otp, setOtp] = useState("");

	const [isLoading, setIsLoading] = useState(false);
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const mutedColor = useThemeColor("muted");
	const foregroundColor = useThemeColor("foreground");

	async function handleGoogleSignUp() {
		setIsGoogleLoading(true);
		setError(null);

		await authClient.signIn.social(
			{
				provider: "google",
			},
			{
				onError(error: unknown) {
					const err = error as { error?: { message?: string } };
					setError(err.error?.message || "Failed to sign up with Google");
					setIsGoogleLoading(false);
				},
				onSuccess() {
					// Google signin/signup automatically verifies
					Alert.alert("Success", "Account created successfully!");
				},
				onFinished() {
					setIsGoogleLoading(false);
				},
			},
		);
	}

	async function handleSignUp() {
		if (!name || !email || !password || !target || !gender || !phoneNo) {
			setError("All fields are required");
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			await authClient.signUp.email({
				name,
				email,
				password,
				target,
				gender,
				phoneNo,
			} as any);

			// Send OTP via custom API
			await (client as any).v1.auth.sendOTP({ email });

			// Switch to OTP step
			setStep("otp");
		} catch (err: unknown) {
			const error = err as { message?: string };
			setError(error?.message || "Failed to create account");
		} finally {
			setIsLoading(false);
		}
	}

	async function handleVerifyOTP() {
		if (!otp) {
			setError("Please enter the OTP");
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const result = await (client as any).v1.auth.verifyOTP({ email, otp });
			if (!result.success) {
				throw new Error(result.error || "Invalid OTP");
			}

			Alert.alert("Success", "Email verified! You can now sign in.");
			// Reset form
			setStep("form");
			setName("");
			setEmail("");
			setPassword("");
			setTarget("");
			setGender("");
			setPhoneNo("");
			setOtp("");
		} catch (err: unknown) {
			const error = err as { message?: string };
			setError(error?.message || "Invalid OTP");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<Card variant="secondary" className="mt-6 p-4">
			<Card.Title className="mb-4">Create Student Account</Card.Title>

			{error && (
				<View className="mb-4 rounded-lg bg-red-100 p-3">
					<Text className="text-red-600 text-sm">{error}</Text>
				</View>
			)}

			<TextInput
				className="mb-3 rounded-lg border border-divider bg-surface px-4 py-3 text-foreground"
				placeholder="Full Name"
				value={name}
				onChangeText={setName}
				placeholderTextColor={mutedColor}
			/>

			<TextInput
				className="mb-3 rounded-lg border border-divider bg-surface px-4 py-3 text-foreground"
				placeholder="Email"
				value={email}
				onChangeText={setEmail}
				placeholderTextColor={mutedColor}
				keyboardType="email-address"
				autoCapitalize="none"
			/>

			<TextInput
				className="mb-3 rounded-lg border border-divider bg-surface px-4 py-3 text-foreground"
				placeholder="Password"
				value={password}
				onChangeText={setPassword}
				placeholderTextColor={mutedColor}
				secureTextEntry
			/>

			<TextInput
				className="mb-3 rounded-lg border border-divider bg-surface px-4 py-3 text-foreground"
				placeholder="Target (JEE, NEET, 8th, 9th, 10th)"
				value={target}
				onChangeText={setTarget}
				placeholderTextColor={mutedColor}
			/>

			<TextInput
				className="mb-3 rounded-lg border border-divider bg-surface px-4 py-3 text-foreground"
				placeholder="Gender (male/female/other)"
				value={gender}
				onChangeText={setGender}
				placeholderTextColor={mutedColor}
			/>

			<TextInput
				className="mb-4 rounded-lg border border-divider bg-surface px-4 py-3 text-foreground"
				placeholder="Phone Number"
				value={phoneNo}
				onChangeText={setPhoneNo}
				placeholderTextColor={mutedColor}
				keyboardType="phone-pad"
			/>

			{step === "form" ? (
				<>
					<Pressable
						onPress={handleSignUp}
						disabled={isLoading}
						className="mb-3 flex-row items-center justify-center rounded-lg bg-accent p-4 active:opacity-70"
					>
						{isLoading ? (
							<ActivityIndicator size="small" color={foregroundColor} />
						) : (
							<Text className="font-medium text-foreground">
								Create Account
							</Text>
						)}
					</Pressable>

					<View className="mb-4 flex-row items-center">
						<View className="h-px flex-1 bg-divider" />
						<Text className="mx-4 text-muted-foreground">or</Text>
						<View className="h-px flex-1 bg-divider" />
					</View>

					<Pressable
						onPress={handleGoogleSignUp}
						disabled={isGoogleLoading}
						className="flex-row items-center justify-center rounded-lg border border-divider bg-surface p-4 active:opacity-70"
					>
						{isGoogleLoading ? (
							<ActivityIndicator size="small" color={foregroundColor} />
						) : (
							<Text className="font-medium text-foreground">
								Continue with Google
							</Text>
						)}
					</Pressable>
				</>
			) : step === "otp" ? (
				<>
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

					<Pressable onPress={() => setStep("form")} className="p-2">
						<Text className="text-center text-accent">Back to Sign Up</Text>
					</Pressable>
				</>
			) : null}

			<View className="mb-4 flex-row items-center">
				<View className="h-px flex-1 bg-divider" />
				<Text className="mx-4 text-muted-foreground">or</Text>
				<View className="h-px flex-1 bg-divider" />
			</View>

			<Pressable
				onPress={handleGoogleSignUp}
				disabled={isGoogleLoading}
				className="flex-row items-center justify-center rounded-lg border border-divider bg-surface p-4 active:opacity-70"
			>
				{isGoogleLoading ? (
					<ActivityIndicator size="small" color={foregroundColor} />
				) : (
					<Text className="font-medium text-foreground">
						Continue with Google
					</Text>
				)}
			</Pressable>
		</Card>
	);
}
