import { Link, useLocation } from "@tanstack/react-router";
import {
	BadgeCheck,
	Bell,
	BookOpen,
	ChevronRight,
	ChevronsUpDown,
	CreditCard,
	Film,
	GraduationCap,
	LayoutDashboard,
	LogOut,
	Radio,
	Sparkles,
	Users,
} from "lucide-react";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarProvider,
	SidebarRail,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { AdminHeader } from "./header";

// Extended user type that includes custom fields from our auth config
interface ExtendedUser {
	id: string;
	email: string;
	name: string;
	role: "admin" | "student";
	image?: string | null;
}

export function AppSidebar({
	children,
	user,
}: {
	children: React.ReactNode;
	user: ExtendedUser;
}) {
	const location = useLocation();
	const pathname = location.pathname;

	const data = {
		user: {
			name: user.name,
			email: user.email,
			avatar: user.image || "",
		},
		navMain: [
			{
				title: "Dashboard",
				url: "/admin",
				icon: LayoutDashboard,
				isActive: pathname === "/admin",
			},
			{
				title: "Courses",
				url: "/admin/courses",
				icon: BookOpen,
				isActive: pathname.startsWith("/admin/courses"),
			},
			{
				title: "Videos",
				url: "/admin/videos",
				icon: Film,
				isActive: pathname.startsWith("/admin/videos"),
			},
			{
				title: "Live Streams",
				url: "/admin/live",
				icon: Radio,
				isActive: pathname.startsWith("/admin/live"),
			},
			{
				title: "Users",
				url: "/admin/users",
				icon: Users,
				isActive: pathname.startsWith("/admin/users"),
			},
		],
	};

	const handleSignOut = async () => {
		await authClient.signOut();
		window.location.href = "/";
	};

	return (
		<SidebarProvider>
			<Sidebar collapsible="icon">
				<SidebarHeader>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton
								size="lg"
								className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							>
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
									<GraduationCap className="size-4" />
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">EduPlus</span>
									<span className="truncate text-xs">Admin Panel</span>
								</div>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarHeader>
				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupLabel>Platform</SidebarGroupLabel>
						<SidebarMenu>
							{data.navMain.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton
										asChild
										tooltip={item.title}
										isActive={item.isActive}
									>
										<Link to={item.url}>
											<item.icon />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroup>
				</SidebarContent>
				<SidebarFooter>
					<SidebarMenu>
						<SidebarMenuItem>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<SidebarMenuButton
										size="lg"
										className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
									>
										<Avatar className="h-8 w-8 rounded-lg">
											<AvatarImage
												src={data.user.avatar}
												alt={data.user.name}
											/>
											<AvatarFallback className="rounded-lg">CN</AvatarFallback>
										</Avatar>
										<div className="grid flex-1 text-left text-sm leading-tight">
											<span className="truncate font-semibold">
												{data.user.name}
											</span>
											<span className="truncate text-xs">
												{data.user.email}
											</span>
										</div>
										<ChevronsUpDown className="ml-auto size-4" />
									</SidebarMenuButton>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
									side="bottom"
									align="end"
									sideOffset={4}
								>
									<DropdownMenuLabel className="p-0 font-normal">
										<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
											<Avatar className="h-8 w-8 rounded-lg">
												<AvatarImage
													src={data.user.avatar}
													alt={data.user.name}
												/>
												<AvatarFallback className="rounded-lg">
													CN
												</AvatarFallback>
											</Avatar>
											<div className="grid flex-1 text-left text-sm leading-tight">
												<span className="truncate font-semibold">
													{data.user.name}
												</span>
												<span className="truncate text-xs">
													{data.user.email}
												</span>
											</div>
										</div>
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuGroup>
										<DropdownMenuItem>
											<Sparkles />
											Upgrade to Pro
										</DropdownMenuItem>
									</DropdownMenuGroup>
									<DropdownMenuSeparator />
									<DropdownMenuGroup>
										<DropdownMenuItem>
											<BadgeCheck />
											Account
										</DropdownMenuItem>
										<DropdownMenuItem>
											<CreditCard />
											Billing
										</DropdownMenuItem>
										<DropdownMenuItem>
											<Bell />
											Notifications
										</DropdownMenuItem>
									</DropdownMenuGroup>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={handleSignOut}>
										<LogOut />
										Log out
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarFooter>
				<SidebarRail />
			</Sidebar>
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
					<div className="flex items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1" />
						<AdminHeader />
					</div>
				</header>
				<div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
