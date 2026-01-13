import { cn } from "heroui-native";
import { forwardRef } from "react";
import {
	Pressable,
	type PressableProps,
	View,
	type ViewProps,
} from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type CardVariant = "elevated" | "outlined" | "filled";

type BaseCardProps = {
	variant?: CardVariant;
	className?: string;
	children: React.ReactNode;
};

type CardProps = BaseCardProps & ViewProps;
type PressableCardProps = BaseCardProps &
	PressableProps & {
		onPress: () => void;
	};

const variantStyles: Record<CardVariant, string> = {
	elevated: "bg-card shadow-md",
	outlined: "border border-border bg-card",
	filled: "bg-secondary",
};

export const Card = forwardRef<View, CardProps>(
	({ variant = "elevated", className, children, ...props }, ref) => {
		return (
			<View
				ref={ref}
				className={cn(
					"overflow-hidden rounded-2xl",
					variantStyles[variant],
					className,
				)}
				{...props}
			>
				{children}
			</View>
		);
	},
);

Card.displayName = "Card";

export const PressableCard = forwardRef<View, PressableCardProps>(
	({ variant = "elevated", className, children, onPress, ...props }, ref) => {
		const scale = useSharedValue(1);

		const animatedStyle = useAnimatedStyle(() => ({
			transform: [{ scale: scale.value }],
		}));

		const handlePressIn = () => {
			scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
		};

		const handlePressOut = () => {
			scale.value = withSpring(1, { damping: 15, stiffness: 400 });
		};

		return (
			<AnimatedPressable
				ref={ref}
				style={animatedStyle}
				onPressIn={handlePressIn}
				onPressOut={handlePressOut}
				onPress={onPress}
				accessibilityRole="button"
				className={cn(
					"overflow-hidden rounded-2xl",
					variantStyles[variant],
					className,
				)}
				{...props}
			>
				{children}
			</AnimatedPressable>
		);
	},
);

PressableCard.displayName = "PressableCard";

// Card subcomponents
export const CardHeader = forwardRef<View, ViewProps & { className?: string }>(
	({ className, children, ...props }, ref) => (
		<View ref={ref} className={cn("p-4 pb-2", className)} {...props}>
			{children}
		</View>
	),
);

CardHeader.displayName = "CardHeader";

export const CardContent = forwardRef<View, ViewProps & { className?: string }>(
	({ className, children, ...props }, ref) => (
		<View ref={ref} className={cn("p-4 pt-0", className)} {...props}>
			{children}
		</View>
	),
);

CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<View, ViewProps & { className?: string }>(
	({ className, children, ...props }, ref) => (
		<View
			ref={ref}
			className={cn("flex-row items-center p-4 pt-2", className)}
			{...props}
		>
			{children}
		</View>
	),
);

CardFooter.displayName = "CardFooter";
