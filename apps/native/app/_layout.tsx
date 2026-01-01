import "@/global.css";

import { QueryClientProvider } from "@tanstack/react-query";

import { Stack } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ToastProvider } from "@/components/ui";
import { AppThemeProvider } from "@/contexts/app-theme-context";
import { ProgressProvider } from "@/hooks/useProgress";
import { UserProvider } from "@/hooks/useUser";
import { queryClient } from "@/utils/orpc";

export const unstable_settings = {
	initialRouteName: "get-started",
};

function StackLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				animation: "fade",
			}}
		>
			<Stack.Screen name="get-started" />
			<Stack.Screen name="home" />
			<Stack.Screen name="dashboard" />
			<Stack.Screen name="onboarding" />
			<Stack.Screen name="sign_in" />
			<Stack.Screen name="sign_up" />
			<Stack.Screen name="otp-verification" />
			<Stack.Screen name="categories" />
			<Stack.Screen name="category/[id]" />
			<Stack.Screen name="my-batches" />
			<Stack.Screen name="batch/[id]" />
			<Stack.Screen name="batch-detail/[id]" />
			<Stack.Screen name="payment/[id]" />
			<Stack.Screen name="payment-success/[id]" />
			<Stack.Screen name="live-classes" />
			<Stack.Screen name="subject/[id]" />
			<Stack.Screen name="courses" />
			<Stack.Screen name="course/[id]" />
			<Stack.Screen name="all-batches" />
			<Stack.Screen name="lesson/[lessonId]" />
			<Stack.Screen name="profile" />
			<Stack.Screen name="profile-edit" />
			<Stack.Screen name="notifications" />
			<Stack.Screen name="forgot-password" />
			<Stack.Screen name="set-password" />
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
									<ToastProvider>
										<StackLayout />
									</ToastProvider>
								</HeroUINativeProvider>
							</ProgressProvider>
						</UserProvider>
					</AppThemeProvider>
				</KeyboardProvider>
			</GestureHandlerRootView>
		</QueryClientProvider>
	);
}
