import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
	ActivityIndicator,
	Image,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/utils/orpc";

export default function SignInScreen() {
	const insets = useSafeAreaInsets();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleLogin() {
		if (!email.trim() || !password.trim()) {
			setError("Please enter email and password");
			return;
		}

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
					router.replace("/home" as never);
				},
				onFinished() {
					setIsLoading(false);
				},
			},
		);
	}

	return (
		<View
			className="flex-1 bg-[#e8ebe8]"
			style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
		>
			{/* Main Content Card */}
			<View className="m-4 flex-1 rounded-3xl bg-white">
				<ScrollView
					contentContainerStyle={{ flexGrow: 1, padding: 24 }}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
				>
					{/* Back Button */}
					<Pressable
						onPress={() => router.back()}
						className="mb-6 flex-row items-center"
					>
						<Ionicons name="chevron-back" size={24} color="#0f172a" />
						<Text className="ml-1 font-medium text-foreground text-lg">
							Back
						</Text>
					</Pressable>

					{/* Title */}
					<Text className="mb-8 font-bold text-foreground text-xl">
						Log in With E-mail or{"\n"}phone number
					</Text>

					{/* Error Message */}
					{error && (
						<View className="mb-4 rounded-lg bg-red-50 p-3">
							<Text className="text-red-600 text-sm">{error}</Text>
						</View>
					)}

					{/* Email Input */}
					<View className="mb-4 rounded-xl border border-gray-300 px-4 py-3">
						<TextInput
							value={email}
							onChangeText={setEmail}
							placeholder="Email or Phone Numbers"
							placeholderTextColor="#94a3b8"
							className="text-base text-foreground"
							keyboardType="email-address"
							autoCapitalize="none"
							autoCorrect={false}
						/>
					</View>

					{/* Password Input */}
					<View className="mb-2 flex-row items-center rounded-xl border border-gray-300 px-4 py-3">
						<TextInput
							value={password}
							onChangeText={setPassword}
							placeholder="Enter Your Password"
							placeholderTextColor="#94a3b8"
							className="flex-1 text-base text-foreground"
							secureTextEntry={!showPassword}
							autoCapitalize="none"
						/>
						<Pressable onPress={() => setShowPassword(!showPassword)}>
							<Ionicons
								name={showPassword ? "eye-outline" : "eye-off-outline"}
								size={22}
								color="#64748b"
							/>
						</Pressable>
					</View>

					{/* Forgot Password */}
					<Pressable className="mb-8 self-end">
						<Text className="text-red-500">Forget Password ?</Text>
					</Pressable>

					{/* Login Button */}
					<Pressable
						onPress={handleLogin}
						disabled={isLoading}
						className="mb-6 items-center rounded-xl bg-[#1a3a2f] py-4"
					>
						{isLoading ? (
							<ActivityIndicator size="small" color="#ffffff" />
						) : (
							<Text className="font-semibold text-base text-white">Log In</Text>
						)}
					</Pressable>

					{/* Divider */}
					<View className="mb-6 flex-row items-center">
						<View className="h-px flex-1 bg-gray-300" />
						<Text className="mx-4 text-muted-foreground">or</Text>
						<View className="h-px flex-1 bg-gray-300" />
					</View>

					{/* Google Sign In */}
					<View className="rounded-xl border border-gray-300">
						<GoogleSignInButton>
							<Image
								source={{
									uri: "https://www.google.com/favicon.ico",
								}}
								className="mr-3 h-5 w-5"
							/>
							<Text className="font-medium text-foreground">
								Sign Up with Google
							</Text>
						</GoogleSignInButton>
					</View>
				</ScrollView>
			</View>
		</View>
	);
}
