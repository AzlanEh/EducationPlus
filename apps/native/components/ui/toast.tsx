import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
	createContext,
	useCallback,
	useContext,
	useRef,
	useState,
} from "react";
import { Pressable, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
	FadeInUp,
	FadeOutUp,
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Toast Types
type ToastType = "success" | "error" | "warning" | "info";

type ToastConfig = {
	id: string;
	type: ToastType;
	title: string;
	message?: string;
	duration?: number;
	action?: {
		label: string;
		onPress: () => void;
	};
};

type ToastContextType = {
	showToast: (config: Omit<ToastConfig, "id">) => void;
	hideToast: (id: string) => void;
	hideAll: () => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast styles by type
const toastStyles: Record<
	ToastType,
	{ bg: string; icon: keyof typeof Ionicons.glyphMap; iconColor: string }
> = {
	success: {
		bg: "bg-success",
		icon: "checkmark-circle",
		iconColor: "var(--primary-foreground)",
	},
	error: {
		bg: "bg-danger",
		icon: "alert-circle",
		iconColor: "var(--destructive-foreground)",
	},
	warning: {
		bg: "bg-warning",
		icon: "warning",
		iconColor: "var(--foreground)",
	},
	info: {
		bg: "bg-primary",
		icon: "information-circle",
		iconColor: "var(--primary-foreground)",
	},
};

// Individual Toast Component
function Toast({
	toast,
	onHide,
}: {
	toast: ToastConfig;
	onHide: (id: string) => void;
}) {
	const translateY = useSharedValue(0);
	const opacity = useSharedValue(1);
	const style = toastStyles[toast.type];

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.value }],
		opacity: opacity.value,
	}));

	const hideToast = useCallback(() => {
		onHide(toast.id);
	}, [onHide, toast.id]);

	// Swipe to dismiss gesture
	const gesture = Gesture.Pan()
		.onUpdate((event) => {
			if (event.translationY < 0) {
				translateY.value = event.translationY;
			}
		})
		.onEnd((event) => {
			if (event.translationY < -50) {
				// Swipe threshold
				opacity.value = withTiming(0, { duration: 200 });
				translateY.value = withTiming(-100, { duration: 200 }, () => {
					runOnJS(hideToast)();
				});
			} else {
				translateY.value = withSpring(0);
			}
		});

	return (
		<GestureDetector gesture={gesture}>
			<Animated.View
				entering={FadeInUp.springify().damping(15)}
				exiting={FadeOutUp.duration(200)}
				style={animatedStyle}
				className={`mx-4 mb-2 flex-row items-center rounded-2xl p-4 shadow-lg ${style.bg}`}
			>
				{/* Icon */}
				<View className="mr-3">
					<Ionicons name={style.icon} size={24} color={style.iconColor} />
				</View>

				{/* Content */}
				<View className="flex-1">
					<Text
						className={`font-semibold text-base ${
							toast.type === "warning" ? "text-foreground" : "text-white"
						}`}
					>
						{toast.title}
					</Text>
					{toast.message && (
						<Text
							className={`mt-0.5 text-sm ${
								toast.type === "warning"
									? "text-foreground/80"
									: "text-white/90"
							}`}
						>
							{toast.message}
						</Text>
					)}
				</View>

				{/* Action Button */}
				{toast.action && (
					<Pressable
						onPress={() => {
							Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
							toast.action?.onPress();
							hideToast();
						}}
						className={`ml-2 rounded-lg px-3 py-1.5 ${
							toast.type === "warning" ? "bg-foreground/10" : "bg-white/20"
						}`}
					>
						<Text
							className={`font-medium text-sm ${
								toast.type === "warning" ? "text-foreground" : "text-white"
							}`}
						>
							{toast.action.label}
						</Text>
					</Pressable>
				)}

				{/* Close Button */}
				<Pressable
					onPress={() => {
						Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
						hideToast();
					}}
					className="ml-2 p-1"
					hitSlop={8}
				>
					<Ionicons
						name="close"
						size={20}
						color={
							toast.type === "warning"
								? "var(--foreground)"
								: "var(--primary-foreground)"
						}
					/>
				</Pressable>
			</Animated.View>
		</GestureDetector>
	);
}

// Toast Container
function ToastContainer({
	toasts,
	onHide,
}: {
	toasts: ToastConfig[];
	onHide: (id: string) => void;
}) {
	const insets = useSafeAreaInsets();

	if (toasts.length === 0) return null;

	return (
		<View
			className="absolute right-0 left-0 z-50"
			style={{ top: insets.top + 8 }}
			pointerEvents="box-none"
		>
			{toasts.map((toast) => (
				<Toast key={toast.id} toast={toast} onHide={onHide} />
			))}
		</View>
	);
}

// Toast Provider
export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<ToastConfig[]>([]);
	const hideToastRef = useRef<(id: string) => void>(() => {});

	const hideToast = useCallback((id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	// Keep ref updated
	hideToastRef.current = hideToast;

	const showToast = useCallback((config: Omit<ToastConfig, "id">) => {
		const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
		const newToast: ToastConfig = {
			...config,
			id,
			duration: config.duration ?? 4000,
		};

		// Haptic feedback based on type
		switch (config.type) {
			case "success":
				Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
				break;
			case "error":
				Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
				break;
			case "warning":
				Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
				break;
			default:
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		}

		setToasts((prev) => [newToast, ...prev].slice(0, 3)); // Max 3 toasts

		// Auto dismiss
		if (newToast.duration && newToast.duration > 0) {
			setTimeout(() => {
				hideToastRef.current(id);
			}, newToast.duration);
		}
	}, []);

	const hideAll = useCallback(() => {
		setToasts([]);
	}, []);

	return (
		<ToastContext.Provider value={{ showToast, hideToast, hideAll }}>
			{children}
			<ToastContainer toasts={toasts} onHide={hideToast} />
		</ToastContext.Provider>
	);
}

// Hook to use toast
export function useToast() {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error("useToast must be used within ToastProvider");
	}
	return context;
}

// Convenience functions
export const toast = {
	success: (title: string, message?: string) => ({
		type: "success" as const,
		title,
		message,
	}),
	error: (title: string, message?: string) => ({
		type: "error" as const,
		title,
		message,
	}),
	warning: (title: string, message?: string) => ({
		type: "warning" as const,
		title,
		message,
	}),
	info: (title: string, message?: string) => ({
		type: "info" as const,
		title,
		message,
	}),
};
