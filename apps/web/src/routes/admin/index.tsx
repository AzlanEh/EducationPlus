import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/")({
	component: AdminDashboard,
});

function AdminDashboard() {
	return (
		<div className="space-y-4">
			<h1 className="font-bold text-3xl">Admin Dashboard</h1>
			<p className="text-muted-foreground">
				Welcome to the EduPlus administration area. Select a section from the
				sidebar to get started.
			</p>

			<div className="grid gap-4 md:grid-cols-3">
				<div className="rounded-lg border p-6 shadow-sm">
					<h3 className="font-semibold">Courses</h3>
					<p className="text-muted-foreground text-sm">
						Manage your courses and content.
					</p>
				</div>
				{/* Add more stats cards here later */}
			</div>
		</div>
	);
}
