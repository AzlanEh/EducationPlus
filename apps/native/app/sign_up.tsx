import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import {
	Image,
	KeyboardAvoidingView,
	Modal,
	Platform,
	Pressable,
	ScrollView,
	Text,
	View,
} from "react-native";
import Animated, {
	FadeIn,
	FadeInDown,
	FadeInUp,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { Button, Input } from "@/components/ui";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const targetOptions = [
	{ value: "JEE", label: "JEE", icon: "school" },
	{ value: "NEET", label: "NEET", icon: "medical-bag" },
	{ value: "JNVST Class 6", label: "JNVST Class 6", icon: "bank" },
	{ value: "JNVST Class 9", label: "JNVST Class 9", icon: "bank" },
	{ value: "CBSE 8th", label: "CBSE 8th", icon: "book-open-variant" },
	{ value: "CBSE 9th", label: "CBSE 9th", icon: "book-open-variant" },
	{ value: "CBSE 10th", label: "CBSE 10th", icon: "book-open-variant" },
	{ value: "AMU", label: "AMU", icon: "school" },
	{ value: "BEU", label: "BEU", icon: "domain" },
];

const genderOptions = [
	{ value: "Male", label: "Male", icon: "human-male" },
	{ value: "Female", label: "Female", icon: "human-female" },
	{ value: "Other", label: "Other", icon: "account" },
];

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

	// Validation errors
	const [nameError, setNameError] = useState<string | null>(null);
	const [emailError, setEmailError] = useState<string | null>(null);
	const [phoneError, setPhoneError] = useState<string | null>(null);

	// Modal states
	const [showTargetModal, setShowTargetModal] = useState(false);
	const [showGenderModal, setShowGenderModal] = useState(false);

	// Animation
	const backButtonScale = useSharedValue(1);
	const backButtonAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: backButtonScale.value }],
	}));

	const checkboxScale = useSharedValue(1);
	const checkboxAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: checkboxScale.value }],
	}));

	// Validation functions
	const validateName = (value: string) => {
		if (!value.trim()) {
			setNameError("Name is required");
			return false;
		}
		if (value.trim().length < 2) {
			setNameError("Name must be at least 2 characters");
			return false;
		}
		setNameError(null);
		return true;
	};

	const validateEmail = (value: string) => {
		if (!value.trim()) {
			setEmailError("Email is required");
			return false;
		}
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(value)) {
			setEmailError("Please enter a valid email");
			return false;
		}
		setEmailError(null);
		return true;
	};

	const validatePhone = (value: string) => {
		if (!value.trim()) {
			setPhoneError("Phone number is required");
			return false;
		}
		const phoneRegex = /^[0-9]{10}$/;
		if (!phoneRegex.test(value)) {
			setPhoneError("Please enter a valid 10-digit phone number");
			return false;
		}
		setPhoneError(null);
		return true;
	};

	const handleSignUp = async () => {
		const isNameValid = validateName(name);
		const isEmailValid = validateEmail(email);
		const isPhoneValid = validatePhone(phoneNumber);

		if (!isNameValid || !isEmailValid || !isPhoneValid) {
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
			return;
		}

		if (!target) {
			setError("Please select your target exam");
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
			return;
		}

		if (!gender) {
			setError("Please select your gender");
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
			return;
		}

		if (!agreedToTerms) {
			setError("Please agree to Terms of Service and Privacy Policy");
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
			return;
		}

		setIsLoading(true);
		setError(null);

		// Simulate API call - navigate to OTP verification
		setTimeout(() => {
			setIsLoading(false);
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
			router.push({
				pathname: "/otp-verification" as never,
				params: { phone: phoneNumber, email },
			});
		}, 1000);
	};

	const handleBackPress = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		router.back();
	};

	const handleCheckboxToggle = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		checkboxScale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
		setTimeout(() => {
			checkboxScale.value = withSpring(1, { damping: 15, stiffness: 400 });
		}, 100);
		setAgreedToTerms(!agreedToTerms);
	};

	// Select Button Component
	const SelectButton = ({
		value,
		placeholder,
		onPress,
		error: hasError,
	}: {
		value: string;
		placeholder: string;
		onPress: () => void;
		error?: boolean;
	}) => (
		<Pressable
			onPress={() => {
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
				onPress();
			}}
			className={`mb-4 flex-row items-center justify-between rounded-xl border px-4 py-4 ${
				hasError ? "border-danger" : value ? "border-primary" : "border-border"
			}`}
			accessibilityRole="button"
			accessibilityLabel={`Select ${placeholder}`}
		>
			<Text className={`text-base ${value ? "text-foreground" : "text-muted"}`}>
				{value || placeholder}
			</Text>
			<Ionicons
				name="chevron-down"
				size={20}
				color={value ? "var(--primary)" : "var(--muted-foreground)"}
			/>
		</Pressable>
	);

	// Option Modal Component
	const OptionModal = ({
		visible,
		onClose,
		title,
		options,
		selectedValue,
		onSelect,
	}: {
		visible: boolean;
		onClose: () => void;
		title: string;
		options: { value: string; label: string; icon: string }[];
		selectedValue: string;
		onSelect: (value: string) => void;
	}) => (
		<Modal
			visible={visible}
			transparent
			animationType="slide"
			onRequestClose={onClose}
		>
			<Pressable className="flex-1 justify-end bg-black/50" onPress={onClose}>
				<View className="rounded-t-3xl bg-card p-6">
					<View className="mb-4 flex-row items-center justify-between">
						<Text className="font-bold text-foreground text-xl">{title}</Text>
						<Pressable
							onPress={onClose}
							className="rounded-full bg-secondary p-2"
							accessibilityLabel="Close"
						>
							<Ionicons name="close" size={20} color="var(--foreground)" />
						</Pressable>
					</View>
					<ScrollView className="max-h-80" showsVerticalScrollIndicator={false}>
						{options.map((option, index) => (
							<Pressable
								key={option.value}
								onPress={() => {
									Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
									onSelect(option.value);
									onClose();
								}}
								className={`flex-row items-center rounded-xl px-4 py-4 ${
									selectedValue === option.value
										? "bg-primary/10"
										: index < options.length - 1
											? "border-border border-b"
											: ""
								}`}
							>
								<MaterialCommunityIcons
									name={
										option.icon as keyof typeof MaterialCommunityIcons.glyphMap
									}
									size={24}
									color={
										selectedValue === option.value
											? "var(--primary)"
											: "var(--muted-foreground)"
									}
								/>
								<Text
									className={`ml-3 flex-1 text-base ${
										selectedValue === option.value
											? "font-semibold text-primary"
											: "text-foreground"
									}`}
								>
									{option.label}
								</Text>
								{selectedValue === option.value && (
									<Ionicons
										name="checkmark-circle"
										size={24}
										color="var(--primary)"
									/>
								)}
							</Pressable>
						))}
					</ScrollView>
				</View>
			</Pressable>
		</Modal>
	);

	return (
		<View
			className="flex-1 bg-surface"
			style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
		>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				className="flex-1"
			>
				{/* Main Content Card */}
				<Animated.View
					entering={FadeIn.duration(300)}
					className="m-4 flex-1 rounded-3xl bg-card shadow-lg"
				>
					<ScrollView
						contentContainerStyle={{ flexGrow: 1, padding: 24 }}
						showsVerticalScrollIndicator={false}
						keyboardShouldPersistTaps="handled"
					>
						{/* Back Button */}
						<AnimatedPressable
							style={backButtonAnimatedStyle}
							onPress={handleBackPress}
							onPressIn={() => {
								backButtonScale.value = withSpring(0.95);
							}}
							onPressOut={() => {
								backButtonScale.value = withSpring(1);
							}}
							className="mb-6 flex-row items-center self-start rounded-lg p-1"
							accessibilityLabel="Go back"
							accessibilityRole="button"
						>
							<Ionicons
								name="chevron-back"
								size={24}
								color="var(--foreground)"
							/>
							<Text className="ml-1 font-medium text-foreground text-lg">
								Back
							</Text>
						</AnimatedPressable>

						{/* Title */}
						<Animated.View entering={FadeInDown.delay(100).duration(400)}>
							<Text className="mb-2 font-bold text-2xl text-foreground">
								Create Account
							</Text>
							<Text className="mb-6 text-muted-foreground">
								Join thousands of students achieving their goals
							</Text>
						</Animated.View>

						{/* Error Message */}
						{error && (
							<Animated.View
								entering={FadeIn.duration(200)}
								className="mb-4 flex-row items-center rounded-xl bg-danger/10 p-4"
							>
								<Ionicons name="alert-circle" size={20} color="var(--danger)" />
								<Text className="ml-2 flex-1 text-danger">{error}</Text>
							</Animated.View>
						)}

						{/* Name Input */}
						<Animated.View entering={FadeInUp.delay(200).duration(400)}>
							<Input
								label="Full Name"
								value={name}
								onChangeText={(text) => {
									setName(text);
									if (nameError) validateName(text);
								}}
								onBlur={() => validateName(name)}
								placeholder="Enter your full name"
								autoCapitalize="words"
								leftIcon="person-outline"
								error={nameError || undefined}
								showSuccessState={!!name && !nameError}
							/>
						</Animated.View>

						{/* Email Input */}
						<Animated.View entering={FadeInUp.delay(300).duration(400)}>
							<Input
								label="Email Address"
								value={email}
								onChangeText={(text) => {
									setEmail(text);
									if (emailError) validateEmail(text);
								}}
								onBlur={() => validateEmail(email)}
								placeholder="Enter your email"
								keyboardType="email-address"
								autoCapitalize="none"
								leftIcon="mail-outline"
								error={emailError || undefined}
								showSuccessState={!!email && !emailError}
							/>
						</Animated.View>

						{/* Target Select */}
						<Animated.View entering={FadeInUp.delay(400).duration(400)}>
							<SelectButton
								value={target}
								placeholder="Select Your Target Exam"
								onPress={() => setShowTargetModal(true)}
								error={!!error && !target}
							/>
						</Animated.View>

						{/* Gender Select */}
						<Animated.View entering={FadeInUp.delay(500).duration(400)}>
							<SelectButton
								value={gender}
								placeholder="Select Gender"
								onPress={() => setShowGenderModal(true)}
								error={!!error && !gender}
							/>
						</Animated.View>

						{/* Phone Number Input */}
						<Animated.View entering={FadeInUp.delay(600).duration(400)}>
							<View className="mb-4">
								<View
									className={`flex-row items-center rounded-xl border ${
										phoneError
											? "border-danger"
											: phoneNumber && !phoneError
												? "border-primary"
												: "border-border"
									}`}
								>
									{/* Country Code */}
									<View className="flex-row items-center border-border border-r px-3 py-4">
										<Text className="text-lg">🇮🇳</Text>
										<Text className="ml-1 text-foreground">+91</Text>
									</View>
									{/* Phone Input */}
									<Input
										value={phoneNumber}
										onChangeText={(text) => {
											const cleaned = text.replace(/[^0-9]/g, "").slice(0, 10);
											setPhoneNumber(cleaned);
											if (phoneError) validatePhone(cleaned);
										}}
										onBlur={() => validatePhone(phoneNumber)}
										placeholder="Mobile number"
										keyboardType="phone-pad"
										containerClassName="mb-0 flex-1"
										className="border-0"
									/>
								</View>
								{phoneError && (
									<View className="mt-1 flex-row items-center px-1">
										<Ionicons
											name="alert-circle"
											size={14}
											color="var(--danger)"
										/>
										<Text className="ml-1 text-danger text-sm">
											{phoneError}
										</Text>
									</View>
								)}
							</View>
						</Animated.View>

						{/* Terms Agreement */}
						<Animated.View
							entering={FadeInUp.delay(700).duration(400)}
							className="mb-6 flex-row items-start"
						>
							<AnimatedPressable
								style={checkboxAnimatedStyle}
								onPress={handleCheckboxToggle}
								className="mt-0.5 mr-3"
								accessibilityRole="checkbox"
								accessibilityState={{ checked: agreedToTerms }}
							>
								<View
									className={`h-6 w-6 items-center justify-center rounded-lg ${
										agreedToTerms ? "bg-primary" : "border-2 border-border"
									}`}
								>
									{agreedToTerms && (
										<Ionicons name="checkmark" size={16} color="#ffffff" />
									)}
								</View>
							</AnimatedPressable>
							<Text className="flex-1 text-muted-foreground text-sm leading-5">
								By signing up, you agree to our{" "}
								<Text
									className="font-medium text-primary"
									onPress={() => {
										Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
									}}
								>
									Terms of Service
								</Text>{" "}
								and{" "}
								<Text
									className="font-medium text-primary"
									onPress={() => {
										Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
									}}
								>
									Privacy Policy
								</Text>
								.
							</Text>
						</Animated.View>

						{/* Sign Up Button */}
						<Animated.View entering={FadeInUp.delay(800).duration(400)}>
							<Button
								onPress={handleSignUp}
								isLoading={isLoading}
								fullWidth
								size="lg"
								leftIcon={!isLoading ? "person-add-outline" : undefined}
							>
								Create Account
							</Button>
						</Animated.View>

						{/* Divider */}
						<Animated.View
							entering={FadeInUp.delay(900).duration(400)}
							className="my-6 flex-row items-center"
						>
							<View className="h-px flex-1 bg-border" />
							<Text className="mx-4 text-muted-foreground">
								or continue with
							</Text>
							<View className="h-px flex-1 bg-border" />
						</Animated.View>

						{/* Google Sign Up */}
						<Animated.View entering={FadeInUp.delay(1000).duration(400)}>
							<View className="overflow-hidden rounded-xl border border-border">
								<GoogleSignInButton>
									<Image
										source={{
											uri: "https://www.google.com/favicon.ico",
										}}
										className="mr-3 h-5 w-5"
									/>
									<Text className="font-medium text-foreground">
										Continue with Google
									</Text>
								</GoogleSignInButton>
							</View>
						</Animated.View>

						{/* Sign In Link */}
						<Animated.View
							entering={FadeInUp.delay(1100).duration(400)}
							className="mt-6 flex-row items-center justify-center pb-4"
						>
							<Text className="text-muted-foreground">
								Already have an account?{" "}
							</Text>
							<Pressable
								onPress={() => {
									Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
									router.push("/sign_in" as never);
								}}
								accessibilityLabel="Sign in"
								accessibilityRole="button"
							>
								<Text className="font-semibold text-primary">Sign In</Text>
							</Pressable>
						</Animated.View>
					</ScrollView>
				</Animated.View>
			</KeyboardAvoidingView>

			{/* Target Selection Modal */}
			<OptionModal
				visible={showTargetModal}
				onClose={() => setShowTargetModal(false)}
				title="Select Your Target Exam"
				options={targetOptions}
				selectedValue={target}
				onSelect={setTarget}
			/>

			{/* Gender Selection Modal */}
			<OptionModal
				visible={showGenderModal}
				onClose={() => setShowGenderModal(false)}
				title="Select Gender"
				options={genderOptions}
				selectedValue={gender}
				onSelect={setGender}
			/>
		</View>
	);
}
