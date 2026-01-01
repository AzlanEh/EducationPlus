import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomNavigation } from "@/components/bottom-navigation";

// Category data with icons
const categories = [
	{
		id: "amu",
		title: "AMU",
		icon: {
			uri: "https://upload.wikimedia.org/wikipedia/en/thumb/d/d6/Aligarh_Muslim_University_logo.svg/200px-Aligarh_Muslim_University_logo.svg.png",
		},
	},
	{
		id: "jnvst",
		title: "JNVST",
		icon: {
			uri: "https://upload.wikimedia.org/wikipedia/en/thumb/6/6a/Jawahar_Navodaya_Vidyalaya_logo.png/200px-Jawahar_Navodaya_Vidyalaya_logo.png",
		},
	},
	{
		id: "beu",
		title: "BEU",
		icon: {
			uri: "https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/Bihar_Engineering_University_Logo.png/200px-Bihar_Engineering_University_Logo.png",
		},
	},
	{
		id: "jmi",
		title: "JMI",
		icon: {
			uri: "https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/Jamia_Millia_Islamia_logo.png/200px-Jamia_Millia_Islamia_logo.png",
		},
	},
];

type CategoryItemProps = {
	id: string;
	title: string;
	icon: { uri: string };
	onPress?: () => void;
};

function CategoryItem({ title, icon, onPress }: CategoryItemProps) {
	return (
		<Pressable
			onPress={onPress}
			className="m-2 items-center rounded-2xl bg-secondary p-4 shadow-sm"
			style={{ width: 90 }}
		>
			<View className="mb-2 h-14 w-14 items-center justify-center overflow-hidden rounded-lg">
				<Image
					source={icon}
					style={{ width: 48, height: 48 }}
					resizeMode="contain"
				/>
			</View>
			<Text className="text-center font-semibold text-foreground text-sm">
				{title}
			</Text>
		</Pressable>
	);
}

export default function Categories() {
	const insets = useSafeAreaInsets();

	const handleNavigation = (route: string) => {
		if (route === "home") {
			router.push("home" as never);
		} else if (route === "batches") {
			router.push("my-batches" as never);
		} else if (route === "profile") {
			router.push("profile" as never);
		}
	};

	const handleCategoryPress = (categoryId: string) => {
		router.push({
			pathname: "category/[id]" as never,
			params: { id: categoryId },
		});
	};

	return (
		<View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
				showsVerticalScrollIndicator={false}
			>
				<Animated.View entering={FadeInDown} className="flex-1 px-4">
					{/* Back Header */}
					<Pressable
						onPress={() => router.back()}
						className="mb-6 flex-row items-center py-3"
					>
						<Ionicons name="chevron-back" size={24} color="var(--foreground)" />
						<Text className="ml-1 font-medium text-foreground text-lg">
							Back
						</Text>
					</Pressable>

					{/* Categories Grid */}
					<View className="flex-row flex-wrap">
						{categories.map((category) => (
							<CategoryItem
								key={category.id}
								id={category.id}
								title={category.title}
								icon={category.icon}
								onPress={() => handleCategoryPress(category.id)}
							/>
						))}
					</View>
				</Animated.View>
			</ScrollView>

			{/* Bottom Navigation */}
			<BottomNavigation currentRoute="home" onNavigate={handleNavigation} />
		</View>
	);
}
