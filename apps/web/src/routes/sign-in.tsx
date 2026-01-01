import { createFileRoute } from "@tanstack/react-router";

import { SignIn } from "@/components/sign-in";

export const Route = createFileRoute("/sign-in")({
	component: SignInPage,
});

function SignInPage() {
	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<SignIn />
		</div>
	);
}
