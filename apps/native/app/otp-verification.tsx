import { ScrollView, View } from "react-native";
import { OTPVerification } from "@/components/otp-verification";

export default function OTPVerificationScreen() {
	return (
		<ScrollView
			contentContainerStyle={{
				flexGrow: 1,
				justifyContent: "center",
				padding: 20,
			}}
		>
			<View className="flex-1 justify-center">
				<OTPVerification />
			</View>
		</ScrollView>
	);
}
