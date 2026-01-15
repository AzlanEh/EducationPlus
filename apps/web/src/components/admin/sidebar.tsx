import { Link, useLocation } from "@tanstack/react-router";
import {
	BookOpen,
	Film,
	GraduationCap,
	LayoutDashboard,
	LogOut,
	Radio,
	Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AdminSidebar({ className }: SidebarProps) {
	const location = useLocation();
	const pathname = location.pathname;

	const items = [
		{
			title: "Dashboard",
			href: "/admin",
			icon: LayoutDashboard,
		},
		{
			title: "Courses",
			href: "/admin/courses",
			icon: BookOpen,
		},
		{
			title: "Videos",
			href: "/admin/videos",
			icon: Film,
		},
		{
			title: "Live Streams",
			href: "/admin/live",
			icon: Radio,
		},
		{
			title: "Users",
			href: "/admin/users",
			icon: Users,
		},
	];

	const handleSignOut = async () => {
		await authClient.signOut();
		window.location.href = "/";
	};

	return (
		<div className={cn("min-h-screen border-r bg-background pb-12", className)}>
			<div className="space-y-4 py-4">
				<div className="px-3 py-2">
					<div className="mb-6 flex items-center gap-2 px-4">
						<GraduationCap className="h-6 w-6" />
						<h2 className="font-semibold text-lg tracking-tight">
							EduPlus Admin
						</h2>
					</div>
					<div className="space-y-1">
						{items.map((item) => (
							<Button
								key={item.href}
								variant={pathname === item.href ? "secondary" : "ghost"}
								className={cn(
									"w-full justify-start",
									pathname === item.href && "bg-secondary",
								)}
								asChild
							>
								<Link to={item.href}>
									<item.icon className="mr-2 h-4 w-4" />
									{item.title}
								</Link>
							</Button>
						))}
					</div>
				</div>
			</div>
			<div className="absolute bottom-4 mt-auto w-full border-t px-3 py-2 pt-4">
				<Button
					variant="ghost"
					className="w-full justify-start text-muted-foreground hover:text-destructive"
					onClick={handleSignOut}
				>
					<LogOut className="mr-2 h-4 w-4" />
					Sign Out
				</Button>
			</div>
		</div>
	);
}
