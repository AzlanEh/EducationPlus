import { Link, useLocation } from "@tanstack/react-router";
import React from "react";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function AdminHeader() {
	const location = useLocation();
	const pathname = location.pathname;

	// Simple breadcrumb logic
	const segments = pathname.split("/").filter(Boolean);

	return (
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
	);
}
