import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/utils/orpc";
import { useState } from "react";
import {
	ActivityIndicator,
	Text,
	TextInput,
	Pressable,
	View,
} from "react-native";
import { Card, useThemeColor } from "heroui-native";

function SignIn() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const mutedColor = useThemeColor("muted");
	const accentColor = useThemeColor("accent");
	const foregroundColor = useThemeColor("foreground");
	const dangerColor = useThemeColor("danger");

	async function handleLogin() {
		setIsLoading(true);
		setError(null);

		await authClient.signIn.email(
			{
				email,
				password,
			},
			{
				onError(error) {
					setError(error.error?.message || "Failed to sign in");
					setIsLoading(false);
				},
				onSuccess() {
					setEmail("");
					setPassword("");
					queryClient.refetchQueries();
				},
				onFinished() {
					setIsLoading(false);
				},
			},
		);
	}

	async function handleGoogleSignIn() {
		setIsGoogleLoading(true);
		setError(null);

		await authClient.signIn.social(
			{
				provider: "google",
			},
			{
				onError(error) {
					setError(error.error?.message || "Failed to sign in with Google");
					setIsGoogleLoading(false);
				},
				onSuccess() {
					queryClient.refetchQueries();
				},
				onFinished() {
					setIsGoogleLoading(false);
				},
			},
		);
	}

	return (
		<Card variant="secondary" className="mt-6 p-4">
			<Card.Title className="mb-4">Sign In</Card.Title>

			{error ? (
				<View className="mb-4 p-3 bg-danger/10 rounded-lg">
					<Text className="text-danger text-sm">{error}</Text>
				</View>
			) : null}

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
				className="mb-4 py-3 px-4 rounded-lg bg-surface text-foreground border border-divider"
				placeholder="Password"
				value={password}
				onChangeText={setPassword}
				placeholderTextColor={mutedColor}
				secureTextEntry
			/>

			<Pressable
				onPress={handleLogin}
				disabled={isLoading}
				className="bg-accent p-4 rounded-lg flex-row justify-center items-center active:opacity-70 mb-3"
			>
				{isLoading ? (
					<ActivityIndicator size="small" color={foregroundColor} />
				) : (
					<Text className="text-foreground font-medium">Sign In</Text>
				)}
			</Pressable>

			<View className="flex-row items-center mb-4">
				<View className="flex-1 h-px bg-divider" />
				<Text className="mx-4 text-muted-foreground">or</Text>
				<View className="flex-1 h-px bg-divider" />
			</View>

			<Pressable
				onPress={handleGoogleSignIn}
				disabled={isLoading}
				className="bg-surface border border-divider p-4 rounded-lg flex-row justify-center items-center active:opacity-70"
			>
				{isGoogleLoading ? (
					<ActivityIndicator size="small" color={foregroundColor} />
				) : (
					<Text className="text-foreground font-medium">Continue with Google</Text>
				)}
			</Pressable>
		</Card>
	);
}

export { SignIn };
