import "@/global.css";

import { QueryClientProvider } from "@tanstack/react-query";

import { Stack } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { AppThemeProvider } from "@/contexts/app-theme-context";
import { ProgressProvider } from "@/hooks/useProgress";
import { UserProvider } from "@/hooks/useUser";
import { queryClient } from "@/utils/orpc";

export const unstable_settings = {
	initialRouteName: "onboarding",
};

function StackLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				animation: "fade",
			}}
		>
			<Stack.Screen name="home" />
			<Stack.Screen name="dashboard" />
			<Stack.Screen name="onboarding" />
			<Stack.Screen name="sign_in" />
			<Stack.Screen name="sign_up" />
			<Stack.Screen name="otp-verification" />
			<Stack.Screen name="courses" />
			<Stack.Screen name="course/[id]" />
			<Stack.Screen name="lesson/[lessonId]" />
			<Stack.Screen name="profile" />
		</Stack>
	);
}

export default function Layout() {
	return (
		<QueryClientProvider client={queryClient}>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<KeyboardProvider>
					<AppThemeProvider>
						<UserProvider>
							<ProgressProvider>
								<HeroUINativeProvider>
									<StackLayout />
								</HeroUINativeProvider>
							</ProgressProvider>
						</UserProvider>
					</AppThemeProvider>
				</KeyboardProvider>
			</GestureHandlerRootView>
		</QueryClientProvider>
	);
}
