import { ScrollView, View } from "react-native";
import { SignIn } from "@/components/sign-in";

export default function SignInScreen() {
	return (
		<ScrollView
			contentContainerStyle={{
				flexGrow: 1,
				justifyContent: "center",
				padding: 20,
			}}
		>
			<View className="flex-1 justify-center">
				<SignIn />
			</View>
		</ScrollView>
	);
}
