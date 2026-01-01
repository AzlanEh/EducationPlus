import { createFileRoute } from "@tanstack/react-router";

import { OTPVerification } from "@/components/otp-verification";

export const Route = createFileRoute("/otp-verification")({
	component: OTPVerificationPage,
	validateSearch: (search) => ({
		email: (search.email as string) || "",
	}),
});

function OTPVerificationPage() {
	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<OTPVerification />
		</div>
	);
}
