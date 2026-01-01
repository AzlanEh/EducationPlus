import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

const steps = [
	{
		title: "Education Plus",
		subtitle: "Learn, track, and grow with curated courses",
	},
	{
		title: "Track Progress",
		subtitle: "See your completion and keep momentum",
	},
	{ title: "Stay Motivated", subtitle: "Clear goals and beautiful UI" },
];

export function Onboarding() {
	const [index, setIndex] = useState(0);
	const navigate = useNavigate();

	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<div className="text-center">
				{/* Placeholder for image */}
				<div className="mb-8 h-28 w-28 mx-auto bg-gray-200 rounded-full"></div>
				<h1 className="mb-3 text-4xl font-extrabold text-foreground">
					{steps[index].title}
				</h1>
				<p className="mb-10 text-muted-foreground text-sm">
					{steps[index].subtitle}
				</p>
				<div className="mb-6 flex justify-center">
					{steps.map((s, i) => (
						<div
							key={s.title}
							className={`mx-1 h-2 rounded-full ${
								i === index ? "w-6 bg-primary" : "w-2 bg-muted"
							}`}
						/>
					))}
				</div>
				{index < steps.length - 1 ? (
					<Button onClick={() => setIndex((i) => i + 1)} size="lg">
						Next
					</Button>
				) : (
					<Button onClick={() => (navigate as any)({ to: "/" })} size="lg">
						Get Started
					</Button>
				)}
			</div>
		</div>
	);
}
