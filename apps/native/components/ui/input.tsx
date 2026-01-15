import { Ionicons } from "@expo/vector-icons";
import { cn } from "heroui-native";
import { forwardRef, useState } from "react";
import {
	Pressable,
	Text,
	TextInput,
	type TextInputProps,
	View,
} from "react-native";
import Animated, {
	interpolateColor,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedText = Animated.createAnimatedComponent(Text);

type InputState = "default" | "focused" | "error" | "success";

type InputProps = TextInputProps & {
	label?: string;
	error?: string;
	hint?: string;
	leftIcon?: keyof typeof Ionicons.glyphMap;
	rightIcon?: keyof typeof Ionicons.glyphMap;
	onRightIconPress?: () => void;
	isPassword?: boolean;
	showSuccessState?: boolean;
	containerClassName?: string;
};

export const Input = forwardRef<TextInput, InputProps>(
	(
		{
			label,
			error,
			hint,
			leftIcon,
			rightIcon,
			onRightIconPress,
			isPassword = false,
			showSuccessState = false,
			containerClassName,
			className,
			onFocus,
			onBlur,
			value,
			...props
		},
		ref,
	) => {
		const [isFocused, setIsFocused] = useState(false);
		const [showPassword, setShowPassword] = useState(false);
		const focusAnimation = useSharedValue(0);
		const labelPosition = useSharedValue(value ? 1 : 0);

		const getState = (): InputState => {
			if (error) return "error";
			if (showSuccessState && value && !error) return "success";
			if (isFocused) return "focused";
			return "default";
		};

		const state = getState();

		const handleFocus = (
			e: Parameters<NonNullable<TextInputProps["onFocus"]>>[0],
		) => {
			setIsFocused(true);
			focusAnimation.value = withTiming(1, { duration: 200 });
			labelPosition.value = withTiming(1, { duration: 200 });
			onFocus?.(e);
		};

		const handleBlur = (
			e: Parameters<NonNullable<TextInputProps["onBlur"]>>[0],
		) => {
			setIsFocused(false);
			focusAnimation.value = withTiming(0, { duration: 200 });
			if (!value) {
				labelPosition.value = withTiming(0, { duration: 200 });
			}
			onBlur?.(e);
		};

		const borderAnimatedStyle = useAnimatedStyle(() => {
			// Note: interpolateColor doesn't support CSS variables directly in React Native Reanimated.
			// Using conditional style application in render instead for variable support via className.
			// The border color transition is handled by the stateColors mapping in the render function.
			return {};
		});

		const labelAnimatedStyle = useAnimatedStyle(() => ({
			transform: [
				{ translateY: labelPosition.value * -24 },
				{ scale: 1 - labelPosition.value * 0.15 },
			],
			opacity: 0.6 + labelPosition.value * 0.4,
		}));

		const stateColors = {
			default: "border-border",
			focused: "border-primary",
			error: "border-danger",
			success: "border-success",
		};

		const stateIconColors = {
			default: "var(--muted-foreground)",
			focused: "var(--primary)",
			error: "var(--destructive)",
			success: "var(--primary)",
		};

		return (
			<View className={cn("mb-4", containerClassName)}>
				{/* Floating Label */}
				{label && (
					<View className="relative">
						<AnimatedText
							style={labelAnimatedStyle}
							className={cn(
								"absolute top-4 left-4 z-10 bg-card px-1 text-muted-foreground",
								state === "error" && "text-danger",
								state === "success" && "text-success",
								state === "focused" && "text-primary",
							)}
						>
							{label}
						</AnimatedText>
					</View>
				)}

				{/* Input Container */}
				<AnimatedView
					style={state === "focused" ? borderAnimatedStyle : undefined}
					className={cn(
						"flex-row items-center rounded-xl border px-4 py-3",
						stateColors[state],
						state === "focused" && "border-2",
					)}
				>
					{/* Left Icon */}
					{leftIcon && (
						<Ionicons
							name={leftIcon}
							size={20}
							color={stateIconColors[state]}
							style={{ marginRight: 12 }}
						/>
					)}

					{/* Text Input */}
					<TextInput
						ref={ref}
						value={value}
						onFocus={handleFocus}
						onBlur={handleBlur}
						secureTextEntry={isPassword && !showPassword}
						placeholderTextColor="var(--muted-foreground)"
						accessibilityLabel={label}
						accessibilityHint={hint}
						className={cn(
							"flex-1 text-base text-foreground",
							label && "pt-2",
							className,
						)}
						{...props}
					/>

					{/* Right Icon / Password Toggle */}
					{isPassword ? (
						<Pressable
							onPress={() => setShowPassword(!showPassword)}
							hitSlop={8}
							accessibilityLabel={
								showPassword ? "Hide password" : "Show password"
							}
						>
							<Ionicons
								name={showPassword ? "eye-outline" : "eye-off-outline"}
								size={22}
								color={stateIconColors[state]}
							/>
						</Pressable>
					) : rightIcon ? (
						<Pressable
							onPress={onRightIconPress}
							hitSlop={8}
							disabled={!onRightIconPress}
						>
							<Ionicons
								name={rightIcon}
								size={20}
								color={stateIconColors[state]}
							/>
						</Pressable>
					) : null}

					{/* Success Checkmark */}
					{state === "success" && !rightIcon && !isPassword && (
						<Ionicons
							name="checkmark-circle"
							size={20}
							color="var(--primary)"
						/>
					)}
				</AnimatedView>

				{/* Error Message */}
				{error && (
					<View className="mt-1 flex-row items-center px-1">
						<Ionicons
							name="alert-circle"
							size={14}
							color="var(--destructive)"
						/>
						<Text className="ml-1 text-danger text-sm">{error}</Text>
					</View>
				)}

				{/* Hint Text */}
				{hint && !error && (
					<Text className="mt-1 px-1 text-muted-foreground text-sm">
						{hint}
					</Text>
				)}
			</View>
		);
	},
);

Input.displayName = "Input";
