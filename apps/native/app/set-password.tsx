import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SetPasswordScreen() {
	const insets = useSafeAreaInsets();
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const validatePassword = (pwd: string): boolean => {
		// At least 1 number or special character
		return /[0-9!@#$%^&*(),.?":{}|<>]/.test(pwd);
	};

	const handleRegister = async () => {
		if (!password.trim() || !confirmPassword.trim()) {
			setError("Please fill in all fields");
			return;
		}

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		if (!validatePassword(password)) {
			setError("Password must contain at least 1 number or special character");
			return;
		}

		if (password.length < 6) {
			setError("Password must be at least 6 characters");
			return;
		}

		setIsLoading(true);
		setError(null);

		// Simulate registration
		setTimeout(() => {
			setIsLoading(false);
			router.replace("/home" as never);
		}, 1000);
	};

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
						className="mb-8 flex-row items-center"
					>
						<Ionicons name="chevron-back" size={24} color="#0f172a" />
						<Text className="ml-1 font-medium text-foreground text-lg">
							Back
						</Text>
					</Pressable>

					{/* Title */}
					<View className="mb-8 items-center">
						<Text className="font-bold text-2xl text-foreground">
							Set password
						</Text>
						<Text className="mt-2 text-muted-foreground">
							Set your password
						</Text>
					</View>

					{/* Error Message */}
					{error && (
						<View className="mb-4 rounded-lg bg-red-50 p-3">
							<Text className="text-center text-red-600 text-sm">{error}</Text>
						</View>
					)}

					{/* Password Input */}
					<View className="mb-4 flex-row items-center rounded-xl border border-gray-300 px-4 py-3">
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

					{/* Confirm Password Input */}
					<View className="mb-4 flex-row items-center rounded-xl border border-gray-300 px-4 py-3">
						<TextInput
							value={confirmPassword}
							onChangeText={setConfirmPassword}
							placeholder="Confirm Password"
							placeholderTextColor="#94a3b8"
							className="flex-1 text-base text-foreground"
							secureTextEntry={!showConfirmPassword}
							autoCapitalize="none"
						/>
						<Pressable
							onPress={() => setShowConfirmPassword(!showConfirmPassword)}
						>
							<Ionicons
								name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
								size={22}
								color="#64748b"
							/>
						</Pressable>
					</View>

					{/* Password Hint */}
					<Text className="mb-8 text-muted-foreground text-sm">
						Atleast 1 number or a special character
					</Text>

					{/* Spacer */}
					<View className="flex-1" />

					{/* Register Button */}
					<Pressable
						onPress={handleRegister}
						disabled={isLoading}
						className="items-center rounded-xl bg-[#1a3a2f] py-4"
					>
						{isLoading ? (
							<ActivityIndicator size="small" color="#ffffff" />
						) : (
							<Text className="font-semibold text-base text-white">
								Register
							</Text>
						)}
					</Pressable>
				</ScrollView>
			</View>
		</View>
	);
}
