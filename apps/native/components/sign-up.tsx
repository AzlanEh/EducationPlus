import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";
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

type SignUpStep = "form" | "otp";

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
	const [error, setError] = useState<string | null>(null);

	const mutedColor = useThemeColor("muted");
	const foregroundColor = useThemeColor("foreground");

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

			// For now, just show success - OTP implementation needs backend work
			Alert.alert("Success", "Account created! Please check your email for verification.");
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

			<Pressable
				onPress={handleSignUp}
				disabled={isLoading}
				className="bg-accent p-4 rounded-lg flex-row justify-center items-center active:opacity-70"
			>
				{isLoading ? (
					<ActivityIndicator size="small" color={foregroundColor} />
				) : (
					<Text className="text-foreground font-medium">Create Account</Text>
				)}
			</Pressable>
		</Card>
	);
}
