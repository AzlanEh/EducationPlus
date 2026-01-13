import {
	createFileRoute,
	Link,
	Outlet,
	redirect,
} from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

// Extended user type that includes custom fields from our auth config
interface ExtendedUser {
	id: string;
	email: string;
	name: string;
	role: "admin" | "student";
	image?: string | null;
}

export const Route = createFileRoute("/admin")({
	component: AdminLayout,
	beforeLoad: async () => {
		// Check session on the server side before loading the route
		try {
			const serverUrl = import.meta.env.VITE_SERVER_URL;
			const response = await fetch(`${serverUrl}/api/auth/get-session`, {
				credentials: "include",
			});

			if (!response.ok) {
				throw redirect({
					to: "/login",
					search: { invite: undefined },
				});
			}

			const session = await response.json();

			if (!session?.user || session.user.role !== "admin") {
				throw redirect({
					to: "/",
				});
			}

			return { session };
		} catch (error) {
			if (error instanceof Response || (error as { to?: string })?.to) {
				throw error;
			}
			throw redirect({
				to: "/login",
				search: { invite: undefined },
			});
		}
	},
});

function AdminLayout() {
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return (
			<div className="flex h-screen items-center justify-center bg-muted/20">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	const user = session?.user as ExtendedUser | undefined;

	// This should rarely show due to beforeLoad, but kept as fallback
	if (!session || user?.role !== "admin") {
		return (
			<div className="flex h-screen flex-col items-center justify-center gap-4 bg-muted/20">
				<div className="text-center">
					<h1 className="font-bold text-3xl text-foreground tracking-tight">
						Access Denied
					</h1>
					<p className="mt-2 text-muted-foreground">
						You must be an administrator to view this page.
					</p>
				</div>
				<Button asChild size="lg">
					<Link to="/">Go Home</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="grid min-h-screen w-full grid-cols-[250px_1fr] bg-muted/20">
			<AdminSidebar className="hidden md:block" />
			<div className="flex flex-col">
				<AdminHeader />
				<main className="flex-1 overflow-y-auto p-8">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
