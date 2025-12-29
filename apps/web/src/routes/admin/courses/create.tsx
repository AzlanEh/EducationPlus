import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { client } from "@/utils/orpc";

export const Route = createFileRoute("/admin/courses/create")({
	component: CreateCourse,
});

function CreateCourse() {
	const navigate = useNavigate();
	const { data: session } = authClient.useSession();

	const createMutation = useMutation({
		mutationFn: async (data: any) => {
			return await client.v1.course.createCourse(data);
		},
		onSuccess: () => {
			toast.success("Course created successfully");
			navigate({ to: "/admin/courses" });
		},
		onError: (error: Error) => {
			toast.error(`Failed to create course: ${error.message}`);
		},
	});

	const form = useForm({
		defaultValues: {
			title: "",
			description: "",
			subject: "",
			target: "",
			level: "beginner" as "beginner" | "intermediate" | "advanced",
			isPublished: false,
		},
		onSubmit: async ({ value }) => {
			if (!session?.user?.id) {
				toast.error("You must be logged in to create a course");
				return;
			}

			createMutation.mutate({
				...value,
				instructor: session.user.id,
			});
		},
		validators: {
			onSubmit: z.object({
				title: z.string().min(1, "Title is required"),
				description: z.string().min(1, "Description is required"),
				subject: z.string().min(1, "Subject is required"),
				target: z.string().min(1, "Target is required"),
				level: z.enum(["beginner", "intermediate", "advanced"]),
				isPublished: z.boolean(),
			}),
		},
	});

	return (
		<div className="mx-auto max-w-2xl space-y-6">
			<div>
				<h2 className="font-bold text-2xl tracking-tight">Create Course</h2>
				<p className="text-muted-foreground">
					Add a new course to the platform.
				</p>
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-4"
			>
				<form.Field name="title">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="title">Title</Label>
							<Input
								id="title"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
							{field.state.meta.errors.map((error) => (
								<p key={error?.message} className="text-destructive text-sm">
									{error?.message}
								</p>
							))}
						</div>
					)}
				</form.Field>

				<form.Field name="description">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Input
								id="description"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
							{field.state.meta.errors.map((error) => (
								<p key={error?.message} className="text-destructive text-sm">
									{error?.message}
								</p>
							))}
						</div>
					)}
				</form.Field>

				<div className="grid grid-cols-2 gap-4">
					<form.Field name="subject">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="subject">Subject</Label>
								<Input
									id="subject"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="e.g. Physics"
								/>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="text-destructive text-sm">
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>

					<form.Field name="target">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="target">Target Exam</Label>
								<Input
									id="target"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="e.g. JEE, NEET"
								/>
								{field.state.meta.errors.map((error) => (
									<p key={error?.message} className="text-destructive text-sm">
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>
				</div>

				<form.Field name="level">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="level">Level</Label>
							<select
								id="level"
								className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) =>
									field.handleChange(
										e.target.value as "beginner" | "intermediate" | "advanced",
									)
								}
							>
								<option value="beginner">Beginner</option>
								<option value="intermediate">Intermediate</option>
								<option value="advanced">Advanced</option>
							</select>
						</div>
					)}
				</form.Field>

				<form.Field name="isPublished">
					{(field) => (
						<div className="flex items-center space-x-2">
							<input
								type="checkbox"
								id="isPublished"
								className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
								checked={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.checked)}
							/>
							<Label htmlFor="isPublished">Publish immediately</Label>
						</div>
					)}
				</form.Field>

				<div className="flex justify-end gap-4">
					<Button
						variant="outline"
						type="button"
						onClick={() => navigate({ to: "/admin/courses" })}
					>
						Cancel
					</Button>
					<form.Subscribe>
						{(state) => (
							<Button
								type="submit"
								disabled={!state.canSubmit || state.isSubmitting}
							>
								{state.isSubmitting ? "Creating..." : "Create Course"}
							</Button>
						)}
					</form.Subscribe>
				</div>
			</form>
		</div>
	);
}
