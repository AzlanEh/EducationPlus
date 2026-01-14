import { useRouter } from "expo-router";
import { useThemeColor } from "heroui-native";
import { useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Platform,
	Pressable,
	Text,
} from "react-native";
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/utils/orpc";

interface GoogleSignInButtonProps {
	children: React.ReactNode;
	onSuccess?: () => void;
	onError?: (error: any) => void;
}

export function GoogleSignInButton({
	children,
	onSuccess,
	onError,
}: GoogleSignInButtonProps) {
	const [isLoading, setIsLoading] = useState(false);
	const foregroundColor = useThemeColor("foreground");
	const router = useRouter();

	const handleGoogleSignIn = async () => {
		setIsLoading(true);

		try {
			// Use server-side OAuth with callback URL that will be converted to deep link
			// The expoClient plugin will handle the deep link conversion (eduPlus://home)
			await authClient.signIn.social(
				{
					provider: "google",
					callbackURL: "/home", // This becomes eduPlus://home on native
				},
				{
					onSuccess() {
						queryClient.refetchQueries();
						onSuccess?.();
						router.replace("/home");
					},
					onError(error) {
						console.error("Google Sign-In error:", error);
						Alert.alert(
							"Error",
							error.error?.message || "Failed to sign in with Google",
						);
						onError?.(error);
					},
				},
			);
		} catch (error: any) {
			console.error("Google Sign-In error:", error);
			Alert.alert("Error", error.message || "Failed to sign in with Google");
			onError?.(error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Pressable
			onPress={handleGoogleSignIn}
			disabled={isLoading}
			className="flex-row items-center justify-center rounded-lg border border-divider bg-surface p-4 active:opacity-70"
		>
			{isLoading ? (
				<ActivityIndicator size="small" color={foregroundColor} />
			) : (
				children
			)}
		</Pressable>
	);
}
