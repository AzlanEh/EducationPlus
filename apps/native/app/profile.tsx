import { Text, View } from "react-native";
import { Container } from "@/components/container";
import { ProfileForm } from "@/components/profile-form";

export default function Profile() {
	return (
		<Container className="p-6">
			<View className="mb-4">
				<Text className="font-semibold text-foreground text-xl">Profile</Text>
			</View>
			<ProfileForm />
		</Container>
	);
}
