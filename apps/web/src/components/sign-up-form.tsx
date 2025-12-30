import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { authClient } from "@/lib/auth-client";
import { client } from "@/utils/orpc";
import Loader from "./loader";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type SignUpStep = "form" | "verify";

export default function SignUpForm({
	onSwitchToSignIn,
}: {
	onSwitchToSignIn: () => void;
}) {
	const [step, setStep] = useState<SignUpStep>("form");
	const [otp, setOtp] = useState("");
	const [isVerifying, setIsVerifying] = useState(false);

	const navigate = useNavigate({
		from: "/",
	});
	const { isPending } = authClient.useSession();

	const handleVerifyOTP = async () => {
		if (!otp.trim()) {
			toast.error("Please enter the verification code");
			return;
		}

		setIsVerifying(true);
		try {
			const formValues = form.state.values;
			const result = await (client as any).v1.auth.verifyOTP({
				email: formValues.email,
				otp: otp.trim(),
			});
			if (!result.success) {
				throw new Error(result.error || "Invalid verification code");
			}
			toast.success("Email verified successfully!");
			navigate({
				to: "/",
			});
		} catch (error: any) {
			toast.error(error.message || "Invalid verification code");
		} finally {
			setIsVerifying(false);
		}
	};

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
			name: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signUp.email(
				{
					email: value.email,
					password: value.password,
					name: value.name,
				},
				{
					onSuccess: async () => {
						// Send OTP
						await (client as any).v1.auth.sendOTP({ email: value.email });
						setStep("verify");
						toast.success("Check your email for verification code");
					},
					onError: (error) => {
						toast.error(error.error.message || error.error.statusText);
					},
				},
			);
		},
		validators: {
			onSubmit: z.object({
				name: z.string().min(2, "Name must be at least 2 characters"),
				email: z.email("Invalid email address"),
				password: z.string().min(8, "Password must be at least 8 characters"),
			}),
		},
	});

	if (isPending) {
		return <Loader />;
	}

	return (
		<div className="mx-auto mt-10 w-full max-w-md p-6">
			<h1 className="mb-6 text-center font-bold text-3xl">Create Account</h1>

			{step === "form" ? (
				<>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
						className="space-y-4"
					>
						<div>
							<form.Field name="name">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Name</Label>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
										{field.state.meta.errors.map((error) => (
											<p key={error?.message} className="text-red-500">
												{error?.message}
											</p>
										))}
									</div>
								)}
							</form.Field>
						</div>

						<div>
							<form.Field name="email">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Email</Label>
										<Input
											id={field.name}
											name={field.name}
											type="email"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
										{field.state.meta.errors.map((error) => (
											<p key={error?.message} className="text-red-500">
												{error?.message}
											</p>
										))}
									</div>
								)}
							</form.Field>
						</div>

						<div>
							<form.Field name="password">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Password</Label>
										<Input
											id={field.name}
											name={field.name}
											type="password"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
										{field.state.meta.errors.map((error) => (
											<p key={error?.message} className="text-red-500">
												{error?.message}
											</p>
										))}
									</div>
								)}
							</form.Field>
						</div>

						<form.Subscribe>
							{(state) => (
								<Button
									type="submit"
									className="w-full"
									disabled={!state.canSubmit || state.isSubmitting}
								>
									{state.isSubmitting ? "Submitting..." : "Sign Up"}
								</Button>
							)}
						</form.Subscribe>
					</form>

					<div className="mt-6">
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-background px-2 text-muted-foreground">
									Or continue with
								</span>
							</div>
						</div>

						<div className="mt-6">
							<Button
								variant="outline"
								className="w-full"
								onClick={async () => {
									await authClient.signIn.social(
										{
											provider: "google",
										},
										{
											onSuccess: () => {
												navigate({
													to: "/",
												});
												toast.success("Sign up successful");
											},
											onError: (error: unknown) => {
												const err = error as {
													error: { message?: string; statusText?: string };
												};
												toast.error(err.error.message || err.error.statusText);
											},
										},
									);
								}}
							>
								<svg
									className="mr-2 h-4 w-4"
									viewBox="0 0 24 24"
									role="img"
									aria-label="Google"
								>
									<path
										d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
										fill="#4285F4"
									/>
									<path
										d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
										fill="#34A853"
									/>
									<path
										d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
										fill="#FBBC05"
									/>
									<path
										d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
										fill="#EA4335"
									/>
								</svg>
								Continue with Google
							</Button>
						</div>
					</div>

					<div className="mt-4 text-center">
						<Button
							variant="link"
							onClick={onSwitchToSignIn}
							className="text-indigo-600 hover:text-indigo-800"
						>
							Already have an account? Sign In
						</Button>
					</div>
				</>
			) : step === "verify" ? (
				<div className="space-y-4">
					<p className="text-center text-muted-foreground">
						We've sent a verification code to your email. Please enter it below.
					</p>

					<div>
						<Label htmlFor="otp">Verification Code</Label>
						<Input
							id="otp"
							type="text"
							value={otp}
							onChange={(e) => setOtp(e.target.value)}
							placeholder="Enter 6-digit code"
							className="text-center text-lg tracking-widest"
							maxLength={6}
						/>
					</div>

					<Button
						onClick={handleVerifyOTP}
						className="w-full"
						disabled={isVerifying || !otp.trim()}
					>
						{isVerifying ? "Verifying..." : "Verify Email"}
					</Button>

					<Button
						variant="ghost"
						onClick={() => setStep("form")}
						className="w-full"
					>
						Back to Sign Up
					</Button>
				</div>
			) : null}
		</div>
	);
}
