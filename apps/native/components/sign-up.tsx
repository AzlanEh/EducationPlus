import { useRouter } from "expo-router";
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
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { authClient } from "@/lib/auth-client";
import { client } from "@/utils/orpc";

export function SignUp() {
	const router = useRouter();

	// Form fields
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [target, setTarget] = useState("");
	const [gender, setGender] = useState("");
	const [phoneNo, setPhoneNo] = useState("");

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

			// Navigate to OTP verification screen
			router.push({
				pathname: "otp-verification" as any,
				params: { email },
			});
		} catch (err: unknown) {
			const error = err as { message?: string };
			setError(error?.message || "Failed to create account");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<Card variant="secondary" className="mt-6 p-4">
			<Card.Title className="mb-4">Create Student Account</Card.Title>

			{error && (
				<View className="mb-4 rounded-lg bg-danger/10 p-3">
					<Text className="text-danger text-sm">{error}</Text>
				</View>
			)}

			<TextInput
				className="mb-3 rounded-lg border border-border bg-surface px-4 py-3 text-foreground"
				placeholder="Full Name"
				value={name}
				onChangeText={setName}
				placeholderTextColor={mutedColor}
			/>

			<TextInput
				className="mb-3 rounded-lg border border-border bg-surface px-4 py-3 text-foreground"
				placeholder="Email"
				value={email}
				onChangeText={setEmail}
				placeholderTextColor={mutedColor}
				keyboardType="email-address"
				autoCapitalize="none"
			/>

			<TextInput
				className="mb-3 rounded-lg border border-border bg-surface px-4 py-3 text-foreground"
				placeholder="Password"
				value={password}
				onChangeText={setPassword}
				placeholderTextColor={mutedColor}
				secureTextEntry
			/>

			<TextInput
				className="mb-3 rounded-lg border border-border bg-surface px-4 py-3 text-foreground"
				placeholder="Target (JEE, NEET, 8th, 9th, 10th)"
				value={target}
				onChangeText={setTarget}
				placeholderTextColor={mutedColor}
			/>

			<TextInput
				className="mb-3 rounded-lg border border-border bg-surface px-4 py-3 text-foreground"
				placeholder="Gender (male/female/other)"
				value={gender}
				onChangeText={setGender}
				placeholderTextColor={mutedColor}
			/>

			<TextInput
				className="mb-4 rounded-lg border border-border bg-surface px-4 py-3 text-foreground"
				placeholder="Phone Number"
				value={phoneNo}
				onChangeText={setPhoneNo}
				placeholderTextColor={mutedColor}
				keyboardType="phone-pad"
			/>

			<Pressable
				onPress={handleSignUp}
				disabled={isLoading}
				className="mb-3 flex-row items-center justify-center rounded-xl bg-accent p-4 active:opacity-70"
			>
				{isLoading ? (
					<ActivityIndicator size="small" color={foregroundColor} />
				) : (
					<Text className="font-medium text-foreground">Create Account</Text>
				)}
			</Pressable>

			<View className="mb-4 flex-row items-center">
				<View className="h-px flex-1 bg-border" />
				<Text className="mx-4 text-muted-foreground">or</Text>
				<View className="h-px flex-1 bg-border" />
			</View>

			<GoogleSignInButton
				onSuccess={() => {
					Alert.alert("Success", "Account created successfully!");
				}}
			>
				<Text className="font-medium text-foreground">
					Continue with Google
				</Text>
			</GoogleSignInButton>
		</Card>
	);
}
