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
import { client } from "@/utils/orpc";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function SignUpScreen() {
	const insets = useSafeAreaInsets();

	// state
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [target, setTarget] = useState("");
	const [gender, setGender] = useState("");
	const [agreedToTerms, setAgreedToTerms] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// animation
	const backScale = useSharedValue(1);
	const checkboxScale = useSharedValue(1);

	const backStyle = useAnimatedStyle(() => ({
		transform: [{ scale: backScale.value }],
	}));

	const checkboxStyle = useAnimatedStyle(() => ({
		transform: [{ scale: checkboxScale.value }],
	}));

	const handleBack = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		router.back();
	};

	return (
		<View
			className="flex-1 bg-background"
			style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
		>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				className="flex-1"
			>
				<Animated.View
					entering={FadeIn.duration(300)}
					className="m-4 flex-1 rounded-3xl bg-card shadow-lg"
				>
					<ScrollView
						contentContainerStyle={{ padding: 24 }}
						showsVerticalScrollIndicator={false}
					>
						{/* Back */}
						<AnimatedPressable
							style={backStyle}
							onPress={handleBack}
							onPressIn={() => (backScale.value = withSpring(0.95))}
							onPressOut={() => (backScale.value = withSpring(1))}
							className="mb-6 flex-row items-center"
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
						<Animated.View entering={FadeInDown.delay(100)}>
							<Text className="font-bold text-2xl text-card-foreground">
								Create Account
							</Text>
							<Text className="mt-1 text-muted-foreground">
								Join thousands of students achieving their goals
							</Text>
						</Animated.View>

						{/* Error */}
						{error && (
							<View className="mt-4 flex-row rounded-xl bg-destructive/10 p-4">
								<Ionicons
									name="alert-circle"
									size={20}
									color="var(--destructive)"
								/>
								<Text className="ml-2 text-destructive">{error}</Text>
							</View>
						)}

						{/* Inputs */}
						<Animated.View entering={FadeInUp.delay(200)}>
							<Input
								label="Full Name"
								value={name}
								onChangeText={setName}
								placeholder="Enter your full name"
								leftIcon="person-outline"
							/>
						</Animated.View>

						<Animated.View entering={FadeInUp.delay(300)}>
							<Input
								label="Email"
								value={email}
								onChangeText={setEmail}
								placeholder="Enter your email"
								leftIcon="mail-outline"
							/>
						</Animated.View>

						<Animated.View entering={FadeInUp.delay(400)}>
							<Input
								label="Phone Number"
								value={phoneNumber}
								onChangeText={setPhoneNumber}
								placeholder="10-digit number"
								keyboardType="phone-pad"
							/>
						</Animated.View>

						{/* Terms */}
						<Animated.View
							entering={FadeInUp.delay(500)}
							className="mt-6 flex-row"
						>
							<AnimatedPressable
								style={checkboxStyle}
								onPress={() => {
									Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
									checkboxScale.value = withSpring(0.9);
									setAgreedToTerms(!agreedToTerms);
								}}
							>
								<View
									className={`h-6 w-6 rounded-md ${
										agreedToTerms ? "bg-primary" : "border border-border"
									}`}
								/>
							</AnimatedPressable>
							<Text className="ml-3 flex-1 text-muted-foreground text-sm">
								I agree to the{" "}
								<Text className="font-medium text-primary">
									Terms of Service
								</Text>{" "}
								and{" "}
								<Text className="font-medium text-primary">Privacy Policy</Text>
							</Text>
						</Animated.View>

						{/* Submit */}
						<Animated.View entering={FadeInUp.delay(600)} className="mt-8">
							<Button
								onPress={() => {}}
								isLoading={isLoading}
								fullWidth
								size="lg"
							>
								Create Account
							</Button>
						</Animated.View>

						{/* Google */}
						<View className="mt-6 rounded-xl border border-border">
							<GoogleSignInButton>
								<Image
									source={{ uri: "https://www.google.com/favicon.ico" }}
									className="mr-3 h-5 w-5"
								/>
								<Text className="font-medium text-foreground">
									Continue with Google
								</Text>
							</GoogleSignInButton>
						</View>
					</ScrollView>
				</Animated.View>
			</KeyboardAvoidingView>
		</View>
	);
}
