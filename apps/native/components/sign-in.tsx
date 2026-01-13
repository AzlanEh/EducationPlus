import { Card, useThemeColor } from "heroui-native";
import { useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	Text,
	TextInput,
	View,
} from "react-native";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/utils/orpc";

function SignIn() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const mutedColor = useThemeColor("muted");
	const _accentColor = useThemeColor("accent");
	const foregroundColor = useThemeColor("foreground");
	const _dangerColor = useThemeColor("danger");

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

	return (
		<Card variant="secondary" className="mt-6 p-4">
			<Card.Title className="mb-4">Sign In</Card.Title>

			{error ? (
				<View className="mb-4 rounded-lg bg-danger/10 p-3">
					<Text className="text-danger text-sm">{error}</Text>
				</View>
			) : null}

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
				className="mb-4 rounded-lg border border-border bg-surface px-4 py-3 text-foreground"
				placeholder="Password"
				value={password}
				onChangeText={setPassword}
				placeholderTextColor={mutedColor}
				secureTextEntry
			/>

			<Pressable
				onPress={handleLogin}
				disabled={isLoading}
				className="mb-3 flex-row items-center justify-center rounded-xl bg-accent p-4 active:opacity-70"
			>
				{isLoading ? (
					<ActivityIndicator size="small" color={foregroundColor} />
				) : (
					<Text className="font-medium text-foreground">Sign In</Text>
				)}
			</Pressable>

			<View className="mb-4 flex-row items-center">
				<View className="h-px flex-1 bg-border" />
				<Text className="mx-4 text-muted-foreground">or</Text>
				<View className="h-px flex-1 bg-border" />
			</View>

			<GoogleSignInButton>
				<Text className="font-medium text-foreground">
					Continue with Google
				</Text>
			</GoogleSignInButton>
		</Card>
	);
}

export { SignIn };
