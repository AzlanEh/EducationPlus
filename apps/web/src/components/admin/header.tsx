import { Link, useLocation } from "@tanstack/react-router";
import { Bell, Menu } from "lucide-react";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { authClient } from "@/lib/auth-client";
import { AdminSidebar } from "./sidebar";

export function AdminHeader() {
	const { data: session } = authClient.useSession();
	const user = session?.user;
	const location = useLocation();
	const pathname = location.pathname;

	// Simple breadcrumb logic
	const segments = pathname.split("/").filter(Boolean);
	// Remove 'admin' from segments for display if it's the first one, or handle it gracefully
	// Actually, keeping "Admin" as the root breadcrumb is good.

	const initials =
		user?.name
			?.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2) || "AD";

	return (
		<header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6 shadow-sm">
			<Sheet>
				<SheetTrigger asChild>
					<Button variant="outline" size="icon" className="md:hidden">
						<Menu className="h-5 w-5" />
						<span className="sr-only">Toggle Menu</span>
					</Button>
				</SheetTrigger>
				<SheetContent side="left" className="w-[240px] p-0">
					<AdminSidebar className="min-h-[calc(100vh-4rem)] border-none" />
				</SheetContent>
			</Sheet>

			<div className="flex flex-1 items-center gap-4">
				{/* Breadcrumbs - Hidden on very small screens if needed, or just flex */}
				<Breadcrumb className="hidden sm:flex">
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink asChild>
								<Link to="/admin">Admin</Link>
							</BreadcrumbLink>
						</BreadcrumbItem>
						{segments.length > 1 &&
							segments.slice(1).map((segment, index) => {
								// Reconstruct path
								// segments = ['admin', 'courses', 'create']
								// slice(1) = ['courses', 'create']
								// index 0 -> courses. Path should be /admin/courses
								const path = `/admin/${segments.slice(1, index + 1).join("/")}`;
								const isLast = index === segments.slice(1).length - 1;

								return (
									<React.Fragment key={path}>
										<BreadcrumbSeparator />
										<BreadcrumbItem className="capitalize">
											{isLast ? (
												<BreadcrumbPage>{segment}</BreadcrumbPage>
											) : (
												<BreadcrumbLink asChild>
													<Link to={path}>{segment}</Link>
												</BreadcrumbLink>
											)}
										</BreadcrumbItem>
									</React.Fragment>
								);
							})}
					</BreadcrumbList>
				</Breadcrumb>
				{/* Fallback title for mobile or when breadcrumbs are hidden */}
				<h1 className="font-semibold text-foreground text-lg sm:hidden">
					{segments.length > 1
						? segments[segments.length - 1].charAt(0).toUpperCase() +
							segments[segments.length - 1].slice(1)
						: "Dashboard"}
				</h1>
			</div>

			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" className="text-muted-foreground">
					<Bell className="h-5 w-5" />
				</Button>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							className="relative h-9 w-9 rounded-full p-0"
						>
							<Avatar className="h-9 w-9">
								<AvatarImage
									src={user?.image || ""}
									alt={user?.name || "User"}
								/>
								<AvatarFallback>{initials}</AvatarFallback>
							</Avatar>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>My Account</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem disabled>{user?.email}</DropdownMenuItem>
						<DropdownMenuItem>Profile</DropdownMenuItem>
						<DropdownMenuItem>Settings</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
}
