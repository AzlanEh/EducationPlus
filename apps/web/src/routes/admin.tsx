import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/admin")({
	component: AdminLayout,
	beforeLoad: async () => {
		// In a real app, we might want to check session on server or via loader
		// For now, we'll handle it in the component or let the hook handle it
	},
});

function AdminLayout() {
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return (
			<div className="flex h-full items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (!session || session.user.role !== "admin") {
		return (
			<div className="flex h-full flex-col items-center justify-center gap-4">
				<h1 className="font-bold text-2xl">Access Denied</h1>
				<p>You must be an administrator to view this page.</p>
				<Button asChild>
					<Link to="/">Go Home</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="grid h-full grid-cols-[240px_1fr]">
			<aside className="border-r bg-muted/10 p-4">
				<nav className="flex flex-col gap-2">
					<h2 className="mb-4 font-bold text-lg tracking-tight">Admin Panel</h2>
					<Button asChild variant="ghost" className="justify-start">
						<Link to="/admin" activeProps={{ className: "bg-muted" }}>
							Dashboard
						</Link>
					</Button>
					<Button asChild variant="ghost" className="justify-start">
						<Link to="/admin/courses" activeProps={{ className: "bg-muted" }}>
							Courses
						</Link>
					</Button>
				</nav>
			</aside>
			<main className="overflow-y-auto p-8">
				<Outlet />
			</main>
		</div>
	);
}
