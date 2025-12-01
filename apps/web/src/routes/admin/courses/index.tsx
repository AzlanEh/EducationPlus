import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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

	const { data, isLoading, refetch } = orpc.getCourses.useQuery({
		limit,
		offset: (page - 1) * limit,
	});

	const deleteMutation = orpc.deleteCourse.useMutation({
		onSuccess: () => {
			toast.success("Course deleted successfully");
			refetch();
		},
		onError: (error) => {
			toast.error(`Failed to delete course: ${error.message}`);
		},
	});

	const handleDelete = (id: string) => {
		if (
			confirm(
				"Are you sure you want to delete this course? This action cannot be undone.",
			)
		) {
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
				<div>
					<h2 className="font-bold text-2xl tracking-tight">Courses</h2>
					<p className="text-muted-foreground">
						Manage your educational courses here.
					</p>
				</div>
				<Button asChild>
					<Link to="/admin/courses/create">
						<Plus className="mr-2 h-4 w-4" /> Create Course
					</Link>
				</Button>
			</div>

			<div className="rounded-md border">
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
								<TableCell colSpan={6} className="h-24 text-center">
									No courses found.
								</TableCell>
							</TableRow>
						) : (
							data?.courses.map((course) => (
								<TableRow key={course._id}>
									<TableCell className="font-medium">{course.title}</TableCell>
									<TableCell>{course.subject}</TableCell>
									<TableCell>{course.target}</TableCell>
									<TableCell className="capitalize">{course.level}</TableCell>
									<TableCell>
										<span
											className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs ${
												course.isPublished
													? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
													: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
											}`}
										>
											{course.isPublished ? "Published" : "Draft"}
										</span>
									</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end gap-2">
											<Button variant="ghost" size="icon" asChild>
												<Link
													to="/admin/courses/$courseId"
													params={{ courseId: course._id }}
												>
													<Pencil className="h-4 w-4" />
												</Link>
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => handleDelete(course._id)}
												disabled={deleteMutation.isPending}
											>
												<Trash2 className="h-4 w-4 text-destructive" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
