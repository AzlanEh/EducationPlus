import { createFileRoute } from "@tanstack/react-router";
import { Activity, BookOpen, CheckCircle, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/")({
	component: AdminDashboard,
});

function AdminDashboard() {
	// @ts-expect-error - API types need to be fixed
	const { data: stats, isLoading } = orpc.getDashboardStats.useQuery();

	const statCards = [
		{
			title: "Total Courses",
			value: stats?.totalCourses?.toString() || "0",
			change: "Total courses created",
			icon: BookOpen,
		},
		{
			title: "Total Users",
			value: stats?.totalUsers?.toString() || "0",
			change: "Registered users",
			icon: Users,
		},
		{
			title: "Published Courses",
			value: stats?.publishedCourses?.toString() || "0",
			change: "Courses available to students",
			icon: CheckCircle,
		},
		{
			title: "Verified Users",
			value: stats?.verifiedUsers?.toString() || "0",
			change: "Users with verified emails",
			icon: Activity,
		},
	];

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<div className="space-y-8">
			<div className="flex flex-col gap-2">
				<h1 className="font-bold text-3xl tracking-tight">Dashboard</h1>
				<p className="text-muted-foreground">
					Overview of your academy's performance.
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{statCards.map((stat) => (
					<Card key={stat.title}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="font-medium text-sm">
								{stat.title}
							</CardTitle>
							<stat.icon className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="font-bold text-2xl">{stat.value}</div>
							<p className="text-muted-foreground text-xs">{stat.change}</p>
						</CardContent>
					</Card>
				))}
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
				<Card className="col-span-4">
					<CardHeader>
						<CardTitle>Overview</CardTitle>
					</CardHeader>
					<CardContent className="pl-2">
						<div className="flex h-[200px] items-center justify-center rounded-md bg-muted/10 text-muted-foreground">
							Chart Placeholder
						</div>
					</CardContent>
				</Card>
				<Card className="col-span-3">
					<CardHeader>
						<CardTitle>Recent Sales</CardTitle>
						<p className="text-muted-foreground text-sm">
							You made 265 sales this month.
						</p>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{[1, 2, 3, 4, 5].map((i) => (
								<div key={i} className="flex items-center">
									<div className="mr-4 flex h-9 w-9 items-center justify-center rounded-full bg-muted font-medium text-xs">
										{String.fromCharCode(64 + i)}
									</div>
									<div className="space-y-1">
										<p className="font-medium text-sm leading-none">User {i}</p>
										<p className="text-muted-foreground text-sm">
											user{i}@example.com
										</p>
									</div>
									<div className="ml-auto font-medium">+$39.00</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
