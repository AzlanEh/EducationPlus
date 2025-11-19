import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import AdminSignUpForm from "@/components/admin-sign-up-form";
import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

export const Route = createFileRoute("/login")({
	component: RouteComponent,
	validateSearch: (search) => ({
		invite: (search.invite as string) || undefined,
	}),
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
