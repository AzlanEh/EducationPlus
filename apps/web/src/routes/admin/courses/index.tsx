import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/courses/")({
	component: CoursesList,
});

function CoursesList() {
	const [page] = useState(1);
	const limit = 10;

	const { data, isLoading, refetch } = useQuery<{
		courses: any[];
		total: number;
	}>(
		(orpc as any).v1.course.getCourses.queryOptions({
			limit,
			offset: (page - 1) * limit,
		}),
	);

	const deleteMutation = useMutation(
		(orpc as any).v1.course.deleteCourse.mutationOptions({
			onSuccess: () => {
				toast.success("Course deleted successfully");
				refetch();
			},
			onError: (error: any) => {
				toast.error(`Failed to delete course: ${error.message}`);
			},
		}),
	);

	const handleDelete = (id: string) => {
		if (
			confirm(
				"Are you sure you want to delete this course? This action cannot be undone.",
			)
		) {
			// @ts-ignore oRPC mutation is not properly typed
			deleteMutation.mutate({ id });
		}
	};

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div className="space-y-1">
					<h2 className="font-bold text-3xl tracking-tight">Courses</h2>
					<p className="text-muted-foreground">
						Manage your educational content and course listings.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button asChild>
						<Link to="/admin/courses/create">
							<Plus className="mr-2 h-4 w-4" /> Create Course
						</Link>
					</Button>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>All Courses</CardTitle>
					<CardDescription>
						A list of all courses including their title, subject, and status.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Title</TableHead>
								<TableHead>Subject</TableHead>
								<TableHead>Target</TableHead>
								<TableHead>Level</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{data?.courses.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={6}
										className="h-24 text-center text-muted-foreground"
									>
										No courses found. Create one to get started.
									</TableCell>
								</TableRow>
							) : (
								data?.courses.map((course) => (
									<TableRow key={course._id}>
										<TableCell className="font-medium">
											{course.title}
										</TableCell>
										<TableCell>{course.subject}</TableCell>
										<TableCell>{course.target}</TableCell>
										<TableCell className="capitalize">{course.level}</TableCell>
										<TableCell>
											<Badge
												variant="outline"
												className={
													course.isPublished
														? "border-transparent bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
														: "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/50"
												}
											>
												{course.isPublished ? "Published" : "Draft"}
											</Badge>
										</TableCell>
										<TableCell className="text-right">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" className="h-8 w-8 p-0">
														<span className="sr-only">Open menu</span>
														<MoreHorizontal className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuLabel>Actions</DropdownMenuLabel>
													<DropdownMenuItem asChild>
														<Link
															to="/admin/courses/$courseId"
															params={{ courseId: course._id }}
															className="flex w-full cursor-pointer items-center"
														>
															<Pencil className="mr-2 h-4 w-4" /> Edit
														</Link>
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => handleDelete(course._id)}
														className="text-destructive focus:text-destructive"
													>
														<Trash2 className="mr-2 h-4 w-4" /> Delete
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
