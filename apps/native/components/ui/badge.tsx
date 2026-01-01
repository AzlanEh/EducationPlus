import { cn } from "heroui-native";
import { Text, View } from "react-native";

type BadgeVariant =
	| "default"
	| "success"
	| "warning"
	| "danger"
	| "info"
	| "new"
	| "popular"
	| "discount";

type BadgeProps = {
	variant?: BadgeVariant;
	children: React.ReactNode;
	className?: string;
	size?: "sm" | "md";
};

const variantStyles: Record<BadgeVariant, { container: string; text: string }> =
	{
		default: {
			container: "bg-secondary",
			text: "text-foreground",
		},
		success: {
			container: "bg-success/15",
			text: "text-success",
		},
		warning: {
			container: "bg-warning/15",
			text: "text-warning",
		},
		danger: {
			container: "bg-danger/15",
			text: "text-danger",
		},
		info: {
			container: "bg-info/15",
			text: "text-info",
		},
		new: {
			container: "bg-success",
			text: "text-white",
		},
		popular: {
			container: "bg-accent-orange",
			text: "text-white",
		},
		discount: {
			container: "bg-danger",
			text: "text-white",
		},
	};

const sizeStyles = {
	sm: {
		container: "rounded-md px-2 py-0.5",
		text: "text-xs",
	},
	md: {
		container: "rounded-lg px-3 py-1",
		text: "text-sm",
	},
};

export function Badge({
	variant = "default",
	size = "sm",
	children,
	className,
}: BadgeProps) {
	const variantStyle = variantStyles[variant];
	const sizeStyle = sizeStyles[size];

	return (
		<View
			className={cn(variantStyle.container, sizeStyle.container, className)}
		>
			<Text className={cn("font-semibold", variantStyle.text, sizeStyle.text)}>
				{children}
			</Text>
		</View>
	);
}

// Specialized badges for common use cases
export function NewBadge({ className }: { className?: string }) {
	return (
		<Badge variant="new" className={className}>
			New
		</Badge>
	);
}

export function PopularBadge({ className }: { className?: string }) {
	return (
		<Badge variant="popular" className={className}>
			Popular
		</Badge>
	);
}

export function DiscountBadge({
	percentage,
	className,
}: {
	percentage: number;
	className?: string;
}) {
	return (
		<Badge variant="discount" className={className}>
			{percentage}% OFF
		</Badge>
	);
}

export function LiveBadge({ className }: { className?: string }) {
	return (
		<View
			className={cn(
				"flex-row items-center rounded-md bg-danger px-2 py-1",
				className,
			)}
		>
			<View className="mr-1.5 h-2 w-2 animate-pulse rounded-full bg-white" />
			<Text className="font-semibold text-white text-xs">LIVE</Text>
		</View>
	);
}
