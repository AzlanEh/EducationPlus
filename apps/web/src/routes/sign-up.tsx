import { createFileRoute } from "@tanstack/react-router";

import { SignUp } from "@/components/sign-up";

export const Route = createFileRoute("/sign-up")({
	component: SignUpPage,
});

function SignUpPage() {
	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<SignUp />
		</div>
	);
}
