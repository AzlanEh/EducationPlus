import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/forgot-password")({
	component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
	const [emailSent, setEmailSent] = useState(false);
	const [sentEmail, setSentEmail] = useState("");

	const form = useForm({
		defaultValues: {
			email: "",
		},
		onSubmit: async ({ value }) => {
			try {
				await authClient.forgetPassword({
					email: value.email,
					redirectTo: `${window.location.origin}/reset-password`,
				});
				setSentEmail(value.email);
				setEmailSent(true);
				toast.success("Password reset email sent!");
			} catch (error: unknown) {
				const errorMessage =
					error instanceof Error ? error.message : "Failed to send reset email";
				toast.error(errorMessage);
			}
		},
		validators: {
			onSubmit: z.object({
				email: z.string().email("Please enter a valid email address"),
			}),
		},
	});

	if (emailSent) {
		return (
			<div className="flex min-h-[80vh] items-center justify-center">
				<div className="mx-auto w-full max-w-md space-y-6 p-6">
					<div className="flex flex-col items-center space-y-4 text-center">
						<div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
							<Mail className="h-8 w-8 text-primary" />
						</div>
						<h1 className="font-bold text-2xl">Check your email</h1>
						<p className="text-muted-foreground">
							We've sent a password reset link to{" "}
							<span className="font-medium text-foreground">{sentEmail}</span>
						</p>
					</div>

					<div className="space-y-4">
						<p className="text-center text-muted-foreground text-sm">
							Didn't receive the email? Check your spam folder or try again.
						</p>
						<Button
							variant="outline"
							className="w-full"
							onClick={() => {
								setEmailSent(false);
								setSentEmail("");
							}}
						>
							Try another email
						</Button>
						<Button variant="ghost" className="w-full" asChild>
							<Link to="/login" search={{ invite: undefined }}>
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to sign in
							</Link>
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-[80vh] items-center justify-center">
			<div className="mx-auto w-full max-w-md space-y-6 p-6">
				<div className="space-y-2 text-center">
					<h1 className="font-bold text-2xl">Forgot your password?</h1>
					<p className="text-muted-foreground">
						Enter your email address and we'll send you a link to reset your
						password.
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
					<form.Field name="email">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Email</Label>
								<Input
									id={field.name}
									name={field.name}
									type="email"
									placeholder="Enter your email"
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

					<form.Subscribe>
						{(state) => (
							<Button
								type="submit"
								className="w-full"
								disabled={!state.canSubmit || state.isSubmitting}
							>
								{state.isSubmitting ? "Sending..." : "Send reset link"}
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
