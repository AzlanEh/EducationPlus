import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
	Image,
	Modal,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Mock data for batch pricing
const batchPricing = {
	subtotal: 5999,
	gstPercent: 18,
	gstAmount: 0,
	couponDiscount: 999,
};

type StudentDetail = {
	id: string;
	name: string;
	filled: boolean;
};

export default function Payment() {
	const insets = useSafeAreaInsets();
	const { id } = useLocalSearchParams<{ id: string }>();
	const [students, setStudents] = useState<StudentDetail[]>([
		{ id: "1", name: "", filled: false },
		{ id: "2", name: "", filled: false },
		{ id: "3", name: "", filled: false },
	]);
	const [couponCode, setCouponCode] = useState("");
	const [couponApplied, setCouponApplied] = useState(true);
	const [showCouponModal, setShowCouponModal] = useState(false);
	const [showStudentModal, setShowStudentModal] = useState(false);
	const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
	const [studentName, setStudentName] = useState("");

	void id; // Reserved for fetching batch-specific pricing

	const finalPrice =
		batchPricing.subtotal +
		batchPricing.gstAmount -
		(couponApplied ? batchPricing.couponDiscount : 0);

	const handleStudentPress = (index: number) => {
		setCurrentStudentIndex(index);
		setStudentName(students[index].name);
		setShowStudentModal(true);
	};

	const handleSaveStudent = () => {
		const newStudents = [...students];
		newStudents[currentStudentIndex] = {
			...newStudents[currentStudentIndex],
			name: studentName,
			filled: studentName.trim().length > 0,
		};
		setStudents(newStudents);
		setShowStudentModal(false);
		setStudentName("");
	};

	const handleApplyCoupon = () => {
		if (couponCode.trim()) {
			setCouponApplied(true);
			setShowCouponModal(false);
		}
	};

	const handleProceedToPay = () => {
		router.push({
			pathname: "/payment-success/[id]" as never,
			params: { id: id || "1" },
		});
	};

	return (
		<View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ paddingBottom: 100 }}
				showsVerticalScrollIndicator={false}
			>
				{/* Main Content Card */}
				<View className="m-4 flex-1 rounded-3xl bg-card p-4">
					{/* Back Button */}
					<Pressable
						onPress={() => router.back()}
						className="mb-4 flex-row items-center"
					>
						<Ionicons name="chevron-back" size={24} color="var(--foreground)" />
						<Text className="ml-1 font-medium text-foreground text-lg">
							Back
						</Text>
					</Pressable>

					{/* Title */}
					<Animated.View entering={FadeInDown.delay(100)}>
						<Text className="mb-6 font-bold text-foreground text-xl">
							We need more details
						</Text>
					</Animated.View>

					{/* Student Details Section */}
					<Animated.View
						entering={FadeInDown.delay(200)}
						className="mb-4 overflow-hidden rounded-2xl bg-muted/20"
					>
						{students.map((student, index) => (
							<Pressable
								key={student.id}
								onPress={() => handleStudentPress(index)}
								className="flex-row items-center justify-between border-border px-4 py-4"
								style={{
									borderBottomWidth: index < students.length - 1 ? 1 : 0,
								}}
							>
								<Text className="text-base text-foreground">
									{student.filled ? student.name : "Enter Student Details"}
								</Text>
								<Ionicons
									name="chevron-forward"
									size={20}
									color="var(--muted-foreground)"
								/>
							</Pressable>
						))}
					</Animated.View>

					{/* Apply Coupon Section */}
					<Animated.View entering={FadeInDown.delay(300)}>
						<Pressable
							onPress={() => setShowCouponModal(true)}
							className="mb-6 flex-row items-center justify-between rounded-full bg-muted/20 px-4 py-4"
						>
							<View className="flex-row items-center">
								<Image
									source={{
										uri: "https://cdn-icons-png.flaticon.com/512/3514/3514491.png",
									}}
									className="mr-3 h-8 w-8"
									resizeMode="contain"
								/>
								<Text className="font-semibold text-base text-foreground">
									Apply Coupon
								</Text>
							</View>
							<Ionicons
								name="chevron-forward"
								size={20}
								color="var(--muted-foreground)"
							/>
						</Pressable>
					</Animated.View>

					{/* Price Summary Section */}
					<Animated.View
						entering={FadeInDown.delay(400)}
						className="rounded-2xl bg-muted/20 p-4"
					>
						<Text className="mb-4 font-medium text-muted-foreground text-sm uppercase tracking-wide">
							Price Summary
						</Text>

						{/* Sub Total */}
						<View className="mb-3 flex-row items-center justify-between">
							<Text className="text-base text-foreground">Sub Total</Text>
							<Text className="font-medium text-base text-foreground">
								₹{batchPricing.subtotal.toLocaleString()}
							</Text>
						</View>

						{/* GST */}
						<View className="mb-3 flex-row items-center justify-between">
							<Text className="text-base text-muted-foreground">
								GST ( {batchPricing.gstPercent}% )
							</Text>
							<Text className="text-base text-muted-foreground">
								₹{batchPricing.gstAmount}
							</Text>
						</View>

						{/* Coupon Discount */}
						{couponApplied && (
							<View className="mb-3 flex-row items-center justify-between">
								<Text className="text-base text-muted-foreground">
									Coupon Discount (-)
								</Text>
								<Text className="text-base text-muted-foreground">
									₹{batchPricing.couponDiscount}
								</Text>
							</View>
						)}

						{/* Divider */}
						<View className="my-2 h-px bg-border" />

						{/* Final Price */}
						<View className="flex-row items-center justify-between pt-2">
							<Text className="font-semibold text-base text-foreground">
								Final Price
							</Text>
							<Text className="font-bold text-foreground text-lg">
								₹{finalPrice.toLocaleString()}
							</Text>
						</View>
					</Animated.View>
				</View>
			</ScrollView>

			{/* Proceed to Pay Button */}
			<View
				className="absolute right-0 bottom-0 left-0 bg-surface px-4 py-3"
				style={{ paddingBottom: insets.bottom + 12 }}
			>
				<Pressable
					onPress={handleProceedToPay}
					className="items-center rounded-full bg-success py-4"
				>
					<Text className="font-semibold text-lg text-white">
						Proceed to Pay ₹{finalPrice.toLocaleString()}
					</Text>
				</Pressable>
			</View>

			{/* Student Details Modal */}
			<Modal
				visible={showStudentModal}
				transparent
				animationType="slide"
				onRequestClose={() => setShowStudentModal(false)}
			>
				<View className="flex-1 justify-end bg-black/50">
					<View className="rounded-t-3xl bg-card p-6">
						<Text className="mb-4 font-bold text-foreground text-xl">
							Enter Student Details
						</Text>

						<TextInput
							value={studentName}
							onChangeText={setStudentName}
							placeholder="Enter student name"
							className="mb-4 rounded-xl border border-border px-4 py-3 text-base"
							autoFocus
						/>

						<View className="flex-row gap-3">
							<Pressable
								onPress={() => setShowStudentModal(false)}
								className="flex-1 items-center rounded-xl border border-border py-3"
							>
								<Text className="font-medium text-foreground">Cancel</Text>
							</Pressable>
							<Pressable
								onPress={handleSaveStudent}
								className="flex-1 items-center rounded-xl bg-success py-3"
							>
								<Text className="font-medium text-white">Save</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>

			{/* Coupon Modal */}
			<Modal
				visible={showCouponModal}
				transparent
				animationType="slide"
				onRequestClose={() => setShowCouponModal(false)}
			>
				<View className="flex-1 justify-end bg-black/50">
					<View className="rounded-t-3xl bg-card p-6">
						<Text className="mb-4 font-bold text-foreground text-xl">
							Apply Coupon Code
						</Text>

						<TextInput
							value={couponCode}
							onChangeText={setCouponCode}
							placeholder="Enter coupon code"
							className="mb-4 rounded-xl border border-border px-4 py-3 text-base uppercase"
							autoCapitalize="characters"
							autoFocus
						/>

						<View className="flex-row gap-3">
							<Pressable
								onPress={() => setShowCouponModal(false)}
								className="flex-1 items-center rounded-xl border border-border py-3"
							>
								<Text className="font-medium text-foreground">Cancel</Text>
							</Pressable>
							<Pressable
								onPress={handleApplyCoupon}
								className="flex-1 items-center rounded-xl bg-success py-3"
							>
								<Text className="font-medium text-white">Apply</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	);
}
