import { Card } from "heroui-native";
import { useState } from "react";
import { Image, Text, TextInput, View } from "react-native";
import { useUser } from "@/hooks/useUser";

export function ProfileForm() {
	const { user, update } = useUser();
	const [name, setName] = useState(user.name);
	const [email, setEmail] = useState(user.email);

	return (
		<Card variant="secondary" className="p-4">
			<View className="items-center">
				<Image
					source={{ uri: user.avatar }}
					className="mb-4 h-20 w-20 rounded-full"
				/>
			</View>
			<View className="mb-3">
				<Text className="mb-1 text-muted-foreground text-sm">Name</Text>
				<TextInput
					value={name}
					onChangeText={setName}
					onBlur={() => update({ name })}
					className="rounded-lg border border-muted-foreground/20 p-3 text-foreground"
					placeholder="Your name"
				/>
			</View>
			<View>
				<Text className="mb-1 text-muted-foreground text-sm">Email</Text>
				<TextInput
					value={email}
					onChangeText={setEmail}
					onBlur={() => update({ email })}
					className="rounded-lg border border-muted-foreground/20 p-3 text-foreground"
					placeholder="Email"
					keyboardType="email-address"
					autoCapitalize="none"
				/>
			</View>
		</Card>
	);
}
