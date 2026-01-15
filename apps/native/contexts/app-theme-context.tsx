import type React from "react";
import { createContext, useCallback, useContext, useMemo } from "react";
import { Uniwind, useUniwind } from "uniwind";

type ThemeName = "light" | "dark";

type AppThemeContextType = {
	currentTheme: string;
	isLight: boolean;
	isDark: boolean;
	setTheme: (theme: ThemeName) => void;
	toggleTheme: () => void;
	colors: {
		primary: string;
		background: string;
		card: string;
		text: string;
		border: string;
		notification: string;
	};
};

const AppThemeContext = createContext<AppThemeContextType | undefined>(
	undefined,
);

export const AppThemeProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const { theme } = useUniwind();

	const isLight = useMemo(() => {
		return theme === "light";
	}, [theme]);

	const isDark = useMemo(() => {
		return theme === "dark";
	}, [theme]);

	const colors = useMemo(() => {
		return isDark
			? {
					primary: "#006239",
					background: "#121212",
					card: "#171717",
					text: "#e2e8f0",
					border: "#292929",
					notification: "#c62828",
				}
			: {
					primary: "#2e7d32",
					background: "#f8f5f0",
					card: "#f8f5f0",
					text: "#3e2723",
					border: "#e0d6c9",
					notification: "#c62828",
				};
	}, [isDark]);

	const setTheme = useCallback((newTheme: ThemeName) => {
		Uniwind.setTheme(newTheme);
	}, []);

	const toggleTheme = useCallback(() => {
		Uniwind.setTheme(theme === "light" ? "dark" : "light");
	}, [theme]);

	const value = useMemo(
		() => ({
			currentTheme: theme,
			isLight,
			isDark,
			setTheme,
			toggleTheme,
			colors,
		}),
		[theme, isLight, isDark, setTheme, toggleTheme, colors],
	);

	return (
		<AppThemeContext.Provider value={value}>
			{children}
		</AppThemeContext.Provider>
	);
};

export function useAppTheme() {
	const context = useContext(AppThemeContext);
	if (!context) {
		throw new Error("useAppTheme must be used within AppThemeProvider");
	}
	return context;
}
