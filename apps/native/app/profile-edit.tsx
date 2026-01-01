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

const targetBatchOptions = [
	"JNVST Class 6",
	"JNVST Class 9",
	"JEE",
	"NEET",
	"CBSE 10th",
	"AMU",
	"BEU",
];

const stateOptions = [
	"Bihar",
	"Uttar Pradesh",
	"Delhi",
	"Maharashtra",
	"Karnataka",
	"Tamil Nadu",
	"West Bengal",
	"Rajasthan",
];

export default function ProfileEditScreen() {
	const insets = useSafeAreaInsets();
	const [fullName, setFullName] = useState("");
	const [mobileNumber, setMobileNumber] = useState("");
	const [targetBatch, setTargetBatch] = useState("");
	const [state, setState] = useState("");
	const [district, setDistrict] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	// Modal states
	const [showTargetModal, setShowTargetModal] = useState(false);
	const [showStateModal, setShowStateModal] = useState(false);

	const handleSave = async () => {
		setIsLoading(true);
		// Simulate API call
		setTimeout(() => {
			setIsLoading(false);
			router.back();
		}, 1000);
	};

	const handleCancel = () => {
		router.back();
	};

	const handleImagePick = () => {
		// Image picker logic would go here
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
						className="mb-4 flex-row items-center"
					>
						<Ionicons name="chevron-back" size={24} color="#0f172a" />
						<Text className="ml-1 font-medium text-foreground text-lg">
							Back
						</Text>
					</Pressable>

					{/* Title */}
					<Text className="mb-6 text-center font-bold text-foreground text-xl">
						Profile
					</Text>

					{/* Profile Image */}
					<View className="mb-8 items-center">
						<View className="relative">
							<View className="h-28 w-28 items-center justify-center rounded-full bg-gray-200">
								<Image
									source={{
										uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
									}}
									className="h-28 w-28 rounded-full"
								/>
							</View>
							<Pressable
								onPress={handleImagePick}
								className="absolute right-0 bottom-0 h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#22c55e]"
							>
								<Ionicons name="camera" size={16} color="#ffffff" />
							</Pressable>
						</View>
					</View>

					{/* Form Fields */}
					<View className="gap-4">
						{/* Full Name */}
						<View className="border-gray-200 border-b pb-3">
							<TextInput
								value={fullName}
								onChangeText={setFullName}
								placeholder="Full Name"
								placeholderTextColor="#94a3b8"
								className="text-base text-foreground"
							/>
						</View>

						{/* Mobile Number */}
						<View className="border-gray-200 border-b pb-3">
							<TextInput
								value={mobileNumber}
								onChangeText={setMobileNumber}
								placeholder="Your mobile number"
								placeholderTextColor="#94a3b8"
								className="text-base text-foreground"
								keyboardType="phone-pad"
							/>
						</View>

						{/* Target Batch */}
						<Pressable
							onPress={() => setShowTargetModal(true)}
							className="flex-row items-center justify-between border-gray-200 border-b pb-3"
						>
							<Text
								className={`text-base ${targetBatch ? "text-foreground" : "text-[#94a3b8]"}`}
							>
								{targetBatch || "Your Target Batch"}
							</Text>
							<Ionicons name="chevron-forward" size={20} color="#64748b" />
						</Pressable>

						{/* State */}
						<Pressable
							onPress={() => setShowStateModal(true)}
							className="border-gray-200 border-b pb-3"
						>
							<TextInput
								value={state}
								placeholder="State"
								placeholderTextColor="#94a3b8"
								className="text-base text-foreground"
								editable={false}
								pointerEvents="none"
							/>
						</Pressable>

						{/* District */}
						<View className="border-gray-200 border-b pb-3">
							<TextInput
								value={district}
								onChangeText={setDistrict}
								placeholder="District"
								placeholderTextColor="#94a3b8"
								className="text-base text-foreground"
							/>
						</View>
					</View>

					{/* Spacer */}
					<View className="flex-1" />

					{/* Action Buttons */}
					<View className="mt-8 flex-row gap-4">
						<Pressable
							onPress={handleCancel}
							className="flex-1 items-center rounded-xl border border-gray-300 py-4"
						>
							<Text className="font-semibold text-foreground">Cancel</Text>
						</Pressable>
						<Pressable
							onPress={handleSave}
							disabled={isLoading}
							className="flex-1 items-center rounded-xl bg-[#1a3a2f] py-4"
						>
							{isLoading ? (
								<ActivityIndicator size="small" color="#ffffff" />
							) : (
								<Text className="font-semibold text-white">Save</Text>
							)}
						</Pressable>
					</View>
				</ScrollView>
			</View>

			{/* Target Batch Modal */}
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
							Select Target Batch
						</Text>
						<ScrollView className="max-h-80">
							{targetBatchOptions.map((option) => (
								<Pressable
									key={option}
									onPress={() => {
										setTargetBatch(option);
										setShowTargetModal(false);
									}}
									className={`border-gray-100 border-b py-4 ${
										targetBatch === option ? "bg-green-50" : ""
									}`}
								>
									<Text
										className={`text-base ${
											targetBatch === option
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

			{/* State Modal */}
			<Modal
				visible={showStateModal}
				transparent
				animationType="slide"
				onRequestClose={() => setShowStateModal(false)}
			>
				<Pressable
					className="flex-1 justify-end bg-black/50"
					onPress={() => setShowStateModal(false)}
				>
					<View className="rounded-t-3xl bg-white p-6">
						<Text className="mb-4 font-bold text-foreground text-xl">
							Select State
						</Text>
						<ScrollView className="max-h-80">
							{stateOptions.map((option) => (
								<Pressable
									key={option}
									onPress={() => {
										setState(option);
										setShowStateModal(false);
									}}
									className={`border-gray-100 border-b py-4 ${
										state === option ? "bg-green-50" : ""
									}`}
								>
									<Text
										className={`text-base ${
											state === option
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
		</View>
	);
}
