import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeState } from "./types";

interface ThemeStore extends ThemeState {
	setTheme: (theme: "light" | "dark" | "system") => void;
}

export const useThemeStore = create<ThemeStore>()(
	persist(
		(set) => ({
			theme: "system",

			setTheme: (theme) => set({ theme }),
		}),
		{
			name: "theme-storage",
		},
	),
);
