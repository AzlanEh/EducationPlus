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
			// Use server-side OAuth for all platforms
			// Note: Mobile native Google Sign-In requires custom development build
			// For now, this will redirect to web OAuth flow
			await authClient.signIn.social({
				provider: "google",
			});
			onSuccess?.();
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
