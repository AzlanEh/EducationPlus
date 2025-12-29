import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthState, User } from "./types";

interface AuthStore extends AuthState {
	setUser: (user: User | null) => void;
	setLoading: (loading: boolean) => void;
	setAuthenticated: (authenticated: boolean) => void;
	logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
	persist(
		(set) => ({
			user: null,
			isAuthenticated: false,
			isLoading: true,

			setUser: (user) => set({ user, isAuthenticated: !!user }),

			setLoading: (isLoading) => set({ isLoading }),

			setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

			logout: () =>
				set({
					user: null,
					isAuthenticated: false,
					isLoading: false,
				}),
		}),
		{
			name: "auth-storage",
			partialize: (state) => ({
				user: state.user,
				isAuthenticated: state.isAuthenticated,
			}),
		},
	),
);
