import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
	ActivityIndicator,
	Image,
	Modal,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GoogleSignInButton } from "@/components/google-sign-in-button";

const targetOptions = [
	"JEE",
	"NEET",
	"JNVST Class 6",
	"JNVST Class 9",
	"CBSE 8th",
	"CBSE 9th",
	"CBSE 10th",
	"AMU",
	"BEU",
];

const genderOptions = ["Male", "Female", "Other"];

export default function SignUpScreen() {
	const insets = useSafeAreaInsets();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [target, setTarget] = useState("");
	const [gender, setGender] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [agreedToTerms, setAgreedToTerms] = useState(true);

	// Modal states
	const [showTargetModal, setShowTargetModal] = useState(false);
	const [showGenderModal, setShowGenderModal] = useState(false);

	const handleSignUp = async () => {
		if (
			!name.trim() ||
			!email.trim() ||
			!target ||
			!gender ||
			!phoneNumber.trim()
		) {
			setError("Please fill in all fields");
			return;
		}

		if (!agreedToTerms) {
			setError("Please agree to Terms of Service and Privacy Policy");
			return;
		}

		setIsLoading(true);
		setError(null);

		// Simulate API call - navigate to OTP verification
		setTimeout(() => {
			setIsLoading(false);
			router.push({
				pathname: "/otp-verification" as never,
				params: { phone: phoneNumber, email },
			});
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
						className="mb-6 flex-row items-center"
					>
						<Ionicons name="chevron-back" size={24} color="#0f172a" />
						<Text className="ml-1 font-medium text-foreground text-lg">
							Back
						</Text>
					</Pressable>

					{/* Title */}
					<Text className="mb-6 font-bold text-foreground text-xl">
						Sign up With E-mail or{"\n"}phone number
					</Text>

					{/* Error Message */}
					{error && (
						<View className="mb-4 rounded-lg bg-red-50 p-3">
							<Text className="text-red-600 text-sm">{error}</Text>
						</View>
					)}

					{/* Name Input */}
					<View className="mb-4 rounded-xl border border-gray-300 px-4 py-3">
						<TextInput
							value={name}
							onChangeText={setName}
							placeholder="Name"
							placeholderTextColor="#94a3b8"
							className="text-base text-foreground"
							autoCapitalize="words"
						/>
					</View>

					{/* Email Input */}
					<View className="mb-4 rounded-xl border border-gray-300 px-4 py-3">
						<TextInput
							value={email}
							onChangeText={setEmail}
							placeholder="Email"
							placeholderTextColor="#94a3b8"
							className="text-base text-foreground"
							keyboardType="email-address"
							autoCapitalize="none"
						/>
					</View>

					{/* Target Select */}
					<Pressable
						onPress={() => setShowTargetModal(true)}
						className="mb-4 flex-row items-center justify-between rounded-xl border border-gray-300 px-4 py-4"
					>
						<Text
							className={`text-base ${target ? "text-foreground" : "text-[#94a3b8]"}`}
						>
							{target || "Select Your Target"}
						</Text>
						<Ionicons name="chevron-down" size={20} color="#64748b" />
					</Pressable>

					{/* Gender Select */}
					<Pressable
						onPress={() => setShowGenderModal(true)}
						className="mb-4 flex-row items-center justify-between rounded-xl border border-gray-300 px-4 py-4"
					>
						<Text
							className={`text-base ${gender ? "text-foreground" : "text-[#94a3b8]"}`}
						>
							{gender || "Gender"}
						</Text>
						<Ionicons name="chevron-down" size={20} color="#64748b" />
					</Pressable>

					{/* Phone Number Input */}
					<View className="mb-6 flex-row items-center rounded-xl border border-gray-300">
						{/* Country Code */}
						<View className="flex-row items-center border-gray-300 border-r px-3 py-4">
							<Text className="text-lg">🇮🇳</Text>
							<Ionicons name="chevron-down" size={16} color="#64748b" />
						</View>
						{/* Phone Input */}
						<TextInput
							value={phoneNumber}
							onChangeText={setPhoneNumber}
							placeholder="Your mobile number"
							placeholderTextColor="#94a3b8"
							className="flex-1 px-3 py-3 text-base text-foreground"
							keyboardType="phone-pad"
						/>
					</View>

					{/* Terms Agreement */}
					<View className="mb-6 flex-row items-start">
						<Pressable
							onPress={() => setAgreedToTerms(!agreedToTerms)}
							className="mt-0.5 mr-2"
						>
							<View
								className={`h-5 w-5 items-center justify-center rounded-full ${
									agreedToTerms ? "bg-[#22c55e]" : "border border-gray-400"
								}`}
							>
								{agreedToTerms && (
									<Ionicons name="checkmark" size={14} color="#ffffff" />
								)}
							</View>
						</Pressable>
						<Text className="flex-1 text-muted-foreground text-sm">
							By signing up, you the agree to{" "}
							<Text className="text-[#22c55e]">Term of service</Text>
							{"\n"}and <Text className="text-[#22c55e]">Privacy policy</Text>.
						</Text>
					</View>

					{/* Sign Up Button */}
					<Pressable
						onPress={handleSignUp}
						disabled={isLoading}
						className="mb-6 items-center rounded-xl bg-[#1a3a2f] py-4"
					>
						{isLoading ? (
							<ActivityIndicator size="small" color="#ffffff" />
						) : (
							<Text className="font-semibold text-base text-white">
								Sign up
							</Text>
						)}
					</Pressable>

					{/* Divider */}
					<View className="mb-6 flex-row items-center">
						<View className="h-px flex-1 bg-gray-300" />
						<Text className="mx-4 text-muted-foreground">or</Text>
						<View className="h-px flex-1 bg-gray-300" />
					</View>

					{/* Google Sign Up */}
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

			{/* Target Selection Modal */}
			<Modal
				visible={showTargetModal}
				transparent
				animationType="slide"
				onRequestClose={() => setShowTargetModal(false)}
			>
				<Pressable
					className="flex-1 justify-end bg-black/50"
					onPress={() => setShowTargetModal(false)}
				>
					<View className="rounded-t-3xl bg-white p-6">
						<Text className="mb-4 font-bold text-foreground text-xl">
							Select Your Target
						</Text>
						<ScrollView className="max-h-80">
							{targetOptions.map((option) => (
								<Pressable
									key={option}
									onPress={() => {
										setTarget(option);
										setShowTargetModal(false);
									}}
									className={`border-gray-100 border-b py-4 ${
										target === option ? "bg-green-50" : ""
									}`}
								>
									<Text
										className={`text-base ${
											target === option
												? "font-medium text-[#22c55e]"
												: "text-foreground"
										}`}
									>
										{option}
									</Text>
								</Pressable>
							))}
						</ScrollView>
					</View>
				</Pressable>
			</Modal>

			{/* Gender Selection Modal */}
			<Modal
				visible={showGenderModal}
				transparent
				animationType="slide"
				onRequestClose={() => setShowGenderModal(false)}
			>
				<Pressable
					className="flex-1 justify-end bg-black/50"
					onPress={() => setShowGenderModal(false)}
				>
					<View className="rounded-t-3xl bg-white p-6">
						<Text className="mb-4 font-bold text-foreground text-xl">
							Select Gender
						</Text>
						{genderOptions.map((option) => (
							<Pressable
								key={option}
								onPress={() => {
									setGender(option);
									setShowGenderModal(false);
								}}
								className={`border-gray-100 border-b py-4 ${
									gender === option ? "bg-green-50" : ""
								}`}
							>
								<Text
									className={`text-base ${
										gender === option
											? "font-medium text-[#22c55e]"
											: "text-foreground"
									}`}
								>
									{option}
								</Text>
							</Pressable>
						))}
					</View>
				</Pressable>
			</Modal>
		</View>
	);
}
