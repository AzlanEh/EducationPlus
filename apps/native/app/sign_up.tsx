import { ScrollView, View } from "react-native";
import { SignUp } from "@/components/sign-up";

export default function SignUpScreen() {
	return (
		<ScrollView
			contentContainerStyle={{
				flexGrow: 1,
				justifyContent: "center",
				padding: 20,
			}}
		>
			<View className="flex-1 justify-center">
				<SignUp />
			</View>
		</ScrollView>
	);
}
