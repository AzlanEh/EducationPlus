import { authClient } from "@/lib/auth-client";
import { orpc, client } from "@/utils/orpc";
import { useState } from "react";
import {
	ActivityIndicator,
	Text,
	TextInput,
	Pressable,
	View,
	Alert,
} from "react-native";
import { Card, useThemeColor } from "heroui-native";

type SignUpStep = "form" | "otp" | "google";

export function SignUp() {
	const [step, setStep] = useState<SignUpStep>("form");
	const [userId, setUserId] = useState<string>("");

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
				onError(error: any) {
					setError(error.error?.message || "Failed to sign up with Google");
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

	async function handleVerifyOTP() {
		if (!otp || otp.length !== 6) {
			setError("Please enter a valid 6-digit OTP");
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			await client.verifyOTP({ userId, otp });
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
			setUserId("");
		} catch (err: any) {
			setError(err?.message || "Invalid OTP");
		} finally {
			setIsLoading(false);
		}
	}

	async function handleSignUp() {
		if (!name || !email || !password || !target || !gender || !phoneNo) {
			setError("All fields are required");
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			// Create user account (will be unverified)
			await authClient.signUp.email({
				name,
				email,
				password,
			});

			// Get current session to get user ID
			const session = await authClient.getSession();
			if (!session.data?.user?.id) {
				throw new Error("Failed to get user session");
			}

			setUserId(session.data.user.id);

			// Send OTP
			await client.sendOTP({ userId: session.data.user.id });

			// Switch to OTP step
			setStep("otp");
			setIsLoading(false);
		} catch (err: any) {
			setError(err?.message || "Failed to create account");
			setIsLoading(false);
		}
	}

	return (
		<Card variant="secondary" className="mt-6 p-4">
			<Card.Title className="mb-4">Create Student Account</Card.Title>

			{error && (
				<View className="mb-4 p-3 bg-red-100 rounded-lg">
					<Text className="text-red-600 text-sm">{error}</Text>
				</View>
			)}

			<TextInput
				className="mb-3 py-3 px-4 rounded-lg bg-surface text-foreground border border-divider"
				placeholder="Full Name"
				value={name}
				onChangeText={setName}
				placeholderTextColor={mutedColor}
			/>

			<TextInput
				className="mb-3 py-3 px-4 rounded-lg bg-surface text-foreground border border-divider"
				placeholder="Email"
				value={email}
				onChangeText={setEmail}
				placeholderTextColor={mutedColor}
				keyboardType="email-address"
				autoCapitalize="none"
			/>

			<TextInput
				className="mb-3 py-3 px-4 rounded-lg bg-surface text-foreground border border-divider"
				placeholder="Password"
				value={password}
				onChangeText={setPassword}
				placeholderTextColor={mutedColor}
				secureTextEntry
			/>

			<TextInput
				className="mb-3 py-3 px-4 rounded-lg bg-surface text-foreground border border-divider"
				placeholder="Target (JEE, NEET, 8th, 9th, 10th)"
				value={target}
				onChangeText={setTarget}
				placeholderTextColor={mutedColor}
			/>

			<TextInput
				className="mb-3 py-3 px-4 rounded-lg bg-surface text-foreground border border-divider"
				placeholder="Gender (male/female/other)"
				value={gender}
				onChangeText={setGender}
				placeholderTextColor={mutedColor}
			/>

			<TextInput
				className="mb-4 py-3 px-4 rounded-lg bg-surface text-foreground border border-divider"
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
						className="bg-accent p-4 rounded-lg flex-row justify-center items-center active:opacity-70 mb-3"
					>
						{isLoading ? (
							<ActivityIndicator size="small" color={foregroundColor} />
						) : (
							<Text className="text-foreground font-medium">Create Account</Text>
						)}
					</Pressable>

					<View className="flex-row items-center mb-4">
						<View className="flex-1 h-px bg-divider" />
						<Text className="mx-4 text-muted-foreground">or</Text>
						<View className="flex-1 h-px bg-divider" />
					</View>

					<Pressable
						onPress={handleGoogleSignUp}
						disabled={isGoogleLoading}
						className="bg-surface border border-divider p-4 rounded-lg flex-row justify-center items-center active:opacity-70"
					>
						{isGoogleLoading ? (
							<ActivityIndicator size="small" color={foregroundColor} />
						) : (
							<Text className="text-foreground font-medium">Continue with Google</Text>
						)}
					</Pressable>
				</>
			) : step === "otp" ? (
				<>
					<Text className="mb-4 text-muted-foreground text-center">
						We've sent a 6-digit code to {email}
					</Text>

					<TextInput
						className="mb-4 py-3 px-4 rounded-lg bg-surface text-foreground border border-divider text-center text-xl tracking-widest"
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
						className="bg-accent p-4 rounded-lg flex-row justify-center items-center active:opacity-70 mb-3"
					>
						{isLoading ? (
							<ActivityIndicator size="small" color={foregroundColor} />
						) : (
							<Text className="text-foreground font-medium">Verify Email</Text>
						)}
					</Pressable>

					<Pressable
						onPress={() => setStep("form")}
						className="p-2"
					>
						<Text className="text-accent text-center">Back to Sign Up</Text>
					</Pressable>
				</>
			) : null}
		</Card>
	);
}
