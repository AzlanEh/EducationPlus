import {
	GoogleSignin,
	statusCodes,
} from "@react-native-google-signin/google-signin";
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

	const handleGoogleSignIn = async () => {
		setIsLoading(true);

		try {
			if (Platform.OS === "web") {
				// Web: Use server-side OAuth (redirect-based)
				await authClient.signIn.social({
					provider: "google",
				});
				onSuccess?.();
			} else {
				// Mobile: Use client-side OAuth (ID token)
				await GoogleSignin.hasPlayServices();
				const userInfo = await GoogleSignin.signIn();
				const tokens = await GoogleSignin.getTokens();

				if (tokens.idToken) {
					await authClient.signIn.social({
						provider: "google",
						idToken: {
							token: tokens.idToken,
						},
					});
					onSuccess?.();
				} else {
					throw new Error("No ID token received");
				}
			}
		} catch (error: any) {
			console.error("Google Sign-In error:", error);

			if (error.code === statusCodes.SIGN_IN_CANCELLED) {
				// User cancelled the sign-in flow
				return;
			}
			if (error.code === statusCodes.IN_PROGRESS) {
				Alert.alert("Error", "Sign-in is already in progress");
			} else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
				Alert.alert("Error", "Google Play Services not available");
			} else {
				Alert.alert("Error", error.message || "Failed to sign in with Google");
			}

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
