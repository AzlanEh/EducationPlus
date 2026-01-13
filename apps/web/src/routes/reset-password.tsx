import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/reset-password")({
	component: ResetPasswordPage,
	validateSearch: (search) => ({
		token: (search.token as string) || "",
	}),
});

function ResetPasswordPage() {
	const { token } = Route.useSearch();
	const navigate = useNavigate();
	const [resetSuccess, setResetSuccess] = useState(false);

	const form = useForm({
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
		onSubmit: async ({ value }) => {
			if (value.password !== value.confirmPassword) {
				toast.error("Passwords do not match");
				return;
			}

			try {
				await authClient.resetPassword({
					newPassword: value.password,
					token,
				});
				setResetSuccess(true);
				toast.success("Password reset successfully!");
			} catch (error: unknown) {
				const errorMessage =
					error instanceof Error
						? error.message
						: "Failed to reset password. The link may have expired.";
				toast.error(errorMessage);
			}
		},
		validators: {
			onSubmit: z
				.object({
					password: z
						.string()
						.min(8, "Password must be at least 8 characters")
						.regex(
							/[A-Z]/,
							"Password must contain at least one uppercase letter",
						)
						.regex(
							/[a-z]/,
							"Password must contain at least one lowercase letter",
						)
						.regex(/[0-9]/, "Password must contain at least one number"),
					confirmPassword: z.string(),
				})
				.refine((data) => data.password === data.confirmPassword, {
					message: "Passwords do not match",
					path: ["confirmPassword"],
				}),
		},
	});

	// No token provided
	if (!token) {
		return (
			<div className="flex min-h-[80vh] items-center justify-center">
				<div className="mx-auto w-full max-w-md space-y-6 p-6 text-center">
					<div className="flex flex-col items-center space-y-4">
						<div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
							<XCircle className="h-8 w-8 text-destructive" />
						</div>
						<h1 className="font-bold text-2xl">Invalid reset link</h1>
						<p className="text-muted-foreground">
							This password reset link is invalid or has expired. Please request
							a new one.
						</p>
					</div>
					<Button asChild className="w-full">
						<Link to="/forgot-password">Request new reset link</Link>
					</Button>
				</div>
			</div>
		);
	}

	// Success state
	if (resetSuccess) {
		return (
			<div className="flex min-h-[80vh] items-center justify-center">
				<div className="mx-auto w-full max-w-md space-y-6 p-6 text-center">
					<div className="flex flex-col items-center space-y-4">
						<div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
							<CheckCircle className="h-8 w-8 text-green-500" />
						</div>
						<h1 className="font-bold text-2xl">Password reset successful!</h1>
						<p className="text-muted-foreground">
							Your password has been reset. You can now sign in with your new
							password.
						</p>
					</div>
					<Button
						className="w-full"
						onClick={() =>
							navigate({ to: "/login", search: { invite: undefined } })
						}
					>
						Sign in
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-[80vh] items-center justify-center">
			<div className="mx-auto w-full max-w-md space-y-6 p-6">
				<div className="space-y-2 text-center">
					<h1 className="font-bold text-2xl">Reset your password</h1>
					<p className="text-muted-foreground">
						Enter your new password below.
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
					<form.Field name="password">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>New Password</Label>
								<Input
									id={field.name}
									name={field.name}
									type="password"
									placeholder="Enter new password"
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

					<form.Field name="confirmPassword">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Confirm Password</Label>
								<Input
									id={field.name}
									name={field.name}
									type="password"
									placeholder="Confirm new password"
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

					<div className="rounded-md bg-muted p-3 text-muted-foreground text-sm">
						<p className="font-medium">Password requirements:</p>
						<ul className="mt-1 list-inside list-disc space-y-1">
							<li>At least 8 characters</li>
							<li>One uppercase letter</li>
							<li>One lowercase letter</li>
							<li>One number</li>
						</ul>
					</div>

					<form.Subscribe>
						{(state) => (
							<Button
								type="submit"
								className="w-full"
								disabled={!state.canSubmit || state.isSubmitting}
							>
								{state.isSubmitting ? "Resetting..." : "Reset password"}
							</Button>
						)}
					</form.Subscribe>
				</form>

				<Button variant="ghost" className="w-full" asChild>
					<Link to="/login" search={{ invite: undefined }}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to sign in
					</Link>
				</Button>
			</div>
		</div>
	);
}
