import { create } from "zustand";
import type { AppState } from "./types";

interface AppStore extends AppState {
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
	clearError: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
	isLoading: false,
	error: null,

	setLoading: (isLoading) => set({ isLoading }),

	setError: (error) => set({ error }),

	clearError: () => set({ error: null }),
}));
