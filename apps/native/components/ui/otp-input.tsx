import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { cn } from "heroui-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSequence,
	withSpring,
	withTiming,
} from "react-native-reanimated";

type OTPInputProps = {
	length?: number;
	value: string;
	onChange: (value: string) => void;
	onComplete?: (value: string) => void;
	autoFocus?: boolean;
	error?: string;
	disabled?: boolean;
	className?: string;
};

export function OTPInput({
	length = 6,
	value,
	onChange,
	onComplete,
	autoFocus = true,
	error,
	disabled = false,
	className,
}: OTPInputProps) {
	const inputRef = useRef<TextInput>(null);
	const [isFocused, setIsFocused] = useState(false);
	const shakeAnimation = useSharedValue(0);

	// Shake animation when error
	useEffect(() => {
		if (error) {
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
			shakeAnimation.value = withSequence(
				withTiming(-10, { duration: 50 }),
				withTiming(10, { duration: 50 }),
				withTiming(-10, { duration: 50 }),
				withTiming(10, { duration: 50 }),
				withTiming(0, { duration: 50 }),
			);
		}
	}, [error, shakeAnimation]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: shakeAnimation.value }],
	}));

	// Handle input change
	const handleChange = useCallback(
		(text: string) => {
			// Only allow digits
			const cleanedText = text.replace(/[^0-9]/g, "").slice(0, length);
			onChange(cleanedText);

			// Haptic feedback for each digit
			if (cleanedText.length > value.length) {
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
			}

			// Auto-submit when complete
			if (cleanedText.length === length && onComplete) {
				Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
				onComplete(cleanedText);
			}
		},
		[length, onChange, onComplete, value.length],
	);

	// Focus input on mount if autoFocus
	useEffect(() => {
		if (autoFocus && inputRef.current) {
			setTimeout(() => {
				inputRef.current?.focus();
			}, 100);
		}
	}, [autoFocus]);

	const focusInput = () => {
		inputRef.current?.focus();
	};

	return (
		<View className={cn("items-center", className)}>
			{/* Hidden input for keyboard */}
			<TextInput
				ref={inputRef}
				value={value}
				onChangeText={handleChange}
				onFocus={() => setIsFocused(true)}
				onBlur={() => setIsFocused(false)}
				keyboardType="number-pad"
				maxLength={length}
				autoComplete="one-time-code"
				textContentType="oneTimeCode"
				editable={!disabled}
				style={{
					position: "absolute",
					opacity: 0,
					width: 1,
					height: 1,
				}}
				accessibilityLabel={`Enter ${length}-digit verification code`}
			/>

			{/* Display boxes */}
			<Animated.View style={animatedStyle} className="flex-row gap-2">
				{Array.from({ length }).map((_, index) => {
					const digit = value[index] || "";
					const isCurrentIndex = index === value.length;
					const isFilled = digit !== "";
					const showCursor = isFocused && isCurrentIndex && !disabled;

					return (
						<OTPBox
							key={index}
							digit={digit}
							isFocused={showCursor}
							isFilled={isFilled}
							hasError={!!error}
							disabled={disabled}
							onPress={focusInput}
						/>
					);
				})}
			</Animated.View>

			{/* Error message */}
			{error && (
				<View className="mt-3 flex-row items-center">
					<Ionicons name="alert-circle" size={16} color="var(--destructive)" />
					<Text className="ml-1 text-danger text-sm">{error}</Text>
				</View>
			)}

			{/* Hint */}
			<Text className="mt-4 text-center text-muted-foreground text-sm">
				Paste OTP code directly - it will be detected automatically
			</Text>
		</View>
	);
}

// Individual OTP Box
function OTPBox({
	digit,
	isFocused,
	isFilled,
	hasError,
	disabled,
	onPress,
}: {
	digit: string;
	isFocused: boolean;
	isFilled: boolean;
	hasError: boolean;
	disabled: boolean;
	onPress: () => void;
}) {
	const scale = useSharedValue(1);
	const cursorOpacity = useSharedValue(1);

	// Cursor blink animation
	useEffect(() => {
		if (isFocused) {
			const interval = setInterval(() => {
				cursorOpacity.value = cursorOpacity.value === 1 ? 0 : 1;
			}, 500);
			return () => clearInterval(interval);
		}
		cursorOpacity.value = 1;
	}, [isFocused, cursorOpacity]);

	// Scale animation when filled
	useEffect(() => {
		if (isFilled) {
			scale.value = withSequence(
				withSpring(1.1, { damping: 10, stiffness: 400 }),
				withSpring(1, { damping: 10, stiffness: 400 }),
			);
		}
	}, [isFilled, scale]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const cursorStyle = useAnimatedStyle(() => ({
		opacity: withTiming(cursorOpacity.value, { duration: 100 }),
	}));

	return (
		<Pressable onPress={onPress} disabled={disabled}>
			<Animated.View
				style={animatedStyle}
				className={cn(
					"h-14 w-12 items-center justify-center rounded-xl border-2",
					isFocused && !hasError && "border-primary bg-primary/5",
					isFilled && !hasError && "border-primary bg-primary/10",
					!isFocused && !isFilled && !hasError && "border-border bg-card",
					hasError && "border-danger bg-danger/5",
					disabled && "opacity-50",
				)}
			>
				{digit ? (
					<Text
						className={cn(
							"font-bold text-2xl text-foreground",
							hasError && "text-danger",
						)}
					>
						{digit}
					</Text>
				) : isFocused ? (
					<Animated.View
						style={cursorStyle}
						className="h-6 w-0.5 rounded-full bg-primary"
					/>
				) : null}
			</Animated.View>
		</Pressable>
	);
}
