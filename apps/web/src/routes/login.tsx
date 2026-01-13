import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import AdminSignUpForm from "@/components/admin-sign-up-form";
import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

export const Route = createFileRoute("/login")({
	component: RouteComponent,
	validateSearch: (search) => ({
		invite: (search.invite as string) || undefined,
	}),
	beforeLoad: async ({ search }) => {
		// Don't redirect if there's an invite token (admin signup)
		if (search.invite) {
			return;
		}

		// Check if user is already logged in
		try {
			const serverUrl = import.meta.env.VITE_SERVER_URL;
			const response = await fetch(`${serverUrl}/api/auth/get-session`, {
				credentials: "include",
			});

			if (response.ok) {
				const session = await response.json();
				if (session?.user) {
					// Redirect based on role
					if (session.user.role === "admin") {
						throw redirect({ to: "/admin" });
					}
					throw redirect({ to: "/" });
				}
			}
		} catch (error) {
			// If it's a redirect, rethrow it
			if (error instanceof Response || (error as { to?: string })?.to) {
				throw error;
			}
			// Otherwise, continue to login page
		}
	},
});

function RouteComponent() {
	const { invite } = Route.useSearch();
	const [showSignIn, setShowSignIn] = useState(false);

	// If there's an invite token, show admin signup
	if (invite) {
		return <AdminSignUpForm inviteToken={invite} />;
	}

	return showSignIn ? (
		<SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
	) : (
		<SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
	);
}
