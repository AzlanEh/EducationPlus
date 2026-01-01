import { Ionicons } from "@expo/vector-icons";
import { cn } from "heroui-native";
import { Pressable, Text, View } from "react-native";

type TabItem = {
	name: string;
	icon: keyof typeof Ionicons.glyphMap;
	activeIcon: keyof typeof Ionicons.glyphMap;
	route: string;
};

type BottomNavigationProps = {
	currentRoute: string;
	onNavigate: (route: string) => void;
	className?: string;
};

const tabs: TabItem[] = [
	{ name: "Home", icon: "home-outline", activeIcon: "home", route: "home" },
	{
		name: "Performance",
		icon: "bar-chart-outline",
		activeIcon: "bar-chart",
		route: "performance",
	},
	{
		name: "My Batches",
		icon: "calendar-outline",
		activeIcon: "calendar",
		route: "batches",
	},
	{
		name: "Profile",
		icon: "person-outline",
		activeIcon: "person",
		route: "profile",
	},
];

export function BottomNavigation({
	currentRoute,
	onNavigate,
	className,
}: BottomNavigationProps) {
	const primaryColor = "#2563eb"; // primary color
	const mutedColor = "#94a3b8"; // muted color

	return (
		<View
			className={cn(
				"flex-row items-center justify-around border-border border-t bg-secondary py-2",
				className,
			)}
		>
			{tabs.map((tab) => {
				const isActive = currentRoute === tab.route;
				return (
					<Pressable
						key={tab.route}
						onPress={() => onNavigate(tab.route)}
						className="flex-1 items-center py-2"
					>
						<Ionicons
							name={isActive ? tab.activeIcon : tab.icon}
							size={22}
							color={isActive ? primaryColor : mutedColor}
						/>
						<Text
							className={cn(
								"mt-1 text-xs",
								isActive ? "font-semibold text-primary" : "text-muted",
							)}
						>
							{tab.name}
						</Text>
					</Pressable>
				);
			})}
		</View>
	);
}
