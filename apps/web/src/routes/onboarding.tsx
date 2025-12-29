import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/onboarding")({
	component: Onboarding,
});

function Onboarding() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4 dark:bg-gray-900">
			<h1 className="mb-4 font-bold text-4xl text-gray-900 dark:text-white">
				Welcome to EducationPlus!
			</h1>
			<p className="mb-8 text-center text-gray-700 text-lg dark:text-gray-300">
				Your journey to knowledge starts here.
			</p>
			<Link
				to="/courses"
				className="rounded-lg bg-blue-600 px-6 py-3 text-white shadow-md transition duration-300 hover:bg-blue-700"
			>
				Get Started
			</Link>
		</div>
	);
}
