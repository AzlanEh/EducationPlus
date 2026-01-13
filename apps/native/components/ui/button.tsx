import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { cn } from "heroui-native";
import { forwardRef } from "react";
import {
	ActivityIndicator,
	Pressable,
	type PressableProps,
	Text,
} from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant =
	| "primary"
	| "secondary"
	| "outline"
	| "ghost"
	| "destructive"
	| "success";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = PressableProps & {
	variant?: ButtonVariant;
	size?: ButtonSize;
	isLoading?: boolean;
	leftIcon?: keyof typeof Ionicons.glyphMap;
	rightIcon?: keyof typeof Ionicons.glyphMap;
	fullWidth?: boolean;
	hapticFeedback?: boolean;
	children: React.ReactNode;
	className?: string;
};

const variantStyles: Record<
	ButtonVariant,
	{ container: string; text: string; iconColor: string }
> = {
	primary: {
		container: "bg-primary",
		text: "text-white",
		iconColor: "#ffffff",
	},
	secondary: {
		container: "bg-secondary border border-border",
		text: "text-foreground",
		iconColor: "var(--foreground)",
	},
	outline: {
		container: "border-2 border-primary bg-transparent",
		text: "text-primary",
		iconColor: "var(--primary)",
	},
	ghost: {
		container: "bg-transparent",
		text: "text-foreground",
		iconColor: "var(--foreground)",
	},
	destructive: {
		container: "bg-danger",
		text: "text-white",
		iconColor: "#ffffff",
	},
	success: {
		container: "bg-success",
		text: "text-white",
		iconColor: "#ffffff",
	},
};

const sizeStyles: Record<
	ButtonSize,
	{ container: string; text: string; iconSize: number }
> = {
	sm: {
		container: "rounded-lg px-3 py-2",
		text: "text-sm",
		iconSize: 16,
	},
	md: {
		container: "rounded-xl px-4 py-3",
		text: "text-base",
		iconSize: 20,
	},
	lg: {
		container: "rounded-xl px-6 py-4",
		text: "text-lg",
		iconSize: 24,
	},
};

export const Button = forwardRef<
	React.ComponentRef<typeof Pressable>,
	ButtonProps
>(
	(
		{
			variant = "primary",
			size = "md",
			isLoading = false,
			leftIcon,
			rightIcon,
			fullWidth = false,
			hapticFeedback = true,
			children,
			className,
			disabled,
			onPressIn,
			onPressOut,
			onPress,
			...props
		},
		ref,
	) => {
		const scale = useSharedValue(1);

		const animatedStyle = useAnimatedStyle(() => ({
			transform: [{ scale: scale.value }],
		}));

		const handlePressIn = (
			e: Parameters<NonNullable<PressableProps["onPressIn"]>>[0],
		) => {
			scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
			onPressIn?.(e);
		};

		const handlePressOut = (
			e: Parameters<NonNullable<PressableProps["onPressOut"]>>[0],
		) => {
			scale.value = withSpring(1, { damping: 15, stiffness: 400 });
			onPressOut?.(e);
		};

		const handlePress = (
			e: Parameters<NonNullable<PressableProps["onPress"]>>[0],
		) => {
			if (hapticFeedback && !disabled && !isLoading) {
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
			}
			onPress?.(e);
		};

		const variantStyle = variantStyles[variant];
		const sizeStyle = sizeStyles[size];

		return (
			<AnimatedPressable
				ref={ref}
				style={animatedStyle}
				onPressIn={handlePressIn}
				onPressOut={handlePressOut}
				onPress={handlePress}
				disabled={disabled || isLoading}
				accessibilityRole="button"
				accessibilityState={{ disabled: disabled || isLoading }}
				className={cn(
					"flex-row items-center justify-center",
					variantStyle.container,
					sizeStyle.container,
					fullWidth && "w-full",
					(disabled || isLoading) && "opacity-50",
					className,
				)}
				{...props}
			>
				{isLoading ? (
					<ActivityIndicator size="small" color={variantStyle.iconColor} />
				) : (
					<>
						{leftIcon && (
							<Ionicons
								name={leftIcon}
								size={sizeStyle.iconSize}
								color={variantStyle.iconColor}
								style={{ marginRight: 8 }}
							/>
						)}
						<Text
							className={cn("font-semibold", variantStyle.text, sizeStyle.text)}
						>
							{children}
						</Text>
						{rightIcon && (
							<Ionicons
								name={rightIcon}
								size={sizeStyle.iconSize}
								color={variantStyle.iconColor}
								style={{ marginLeft: 8 }}
							/>
						)}
					</>
				)}
			</AnimatedPressable>
		);
	},
);

Button.displayName = "Button";
