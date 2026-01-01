import { createFileRoute } from "@tanstack/react-router";

import { ProfileForm } from "@/components/profile-form";

export const Route = createFileRoute("/profile")({
	component: ProfilePage,
});

function ProfilePage() {
	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<ProfileForm />
		</div>
	);
}
