import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { client } from "@/utils/orpc";
import Loader from "./loader";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

// =============================================================================
// Validation Schemas
// =============================================================================

const signUpSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Please enter a valid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

// =============================================================================
// Types
// =============================================================================

type SignUpStep = "form" | "verify";

interface SignUpFormProps {
	onSwitchToSignIn: () => void;
}

// =============================================================================
// Component
// =============================================================================

export default function SignUpForm({ onSwitchToSignIn }: SignUpFormProps) {
	const navigate = useNavigate();
	const [step, setStep] = useState<SignUpStep>("form");
	const [otp, setOtp] = useState("");
	const [isVerifying, setIsVerifying] = useState(false);
	const [isSendingOTP, setIsSendingOTP] = useState(false);
	const [formEmail, setFormEmail] = useState("");
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);

	const { data: session, isPending } = authClient.useSession();

	// ===========================================================================
	// OTP Verification Handler
	// ===========================================================================

	const handleVerifyOTP = async () => {
		if (!otp.trim() || otp.length !== 6) {
			toast.error("Please enter a valid 6-digit code");
			return;
		}

		setIsVerifying(true);
		try {
			const result = await client.v1.auth.verifyOTP({
				email: formEmail,
				otp: otp.trim(),
			});

			if (!result.success) {
				throw new Error(result.error || "Invalid verification code");
			}

			toast.success("Email verified successfully!");
			navigate({ to: "/" });
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Verification failed";
			toast.error(message);
		} finally {
			setIsVerifying(false);
		}
	};

	// ===========================================================================
	// Resend OTP Handler
	// ===========================================================================

	const handleResendOTP = async () => {
		if (!formEmail) return;

		setIsSendingOTP(true);
		try {
			await client.v1.auth.sendOTP({ email: formEmail });
			toast.success("Verification code sent!");
		} catch (error) {
			toast.error("Failed to send verification code");
		} finally {
			setIsSendingOTP(false);
		}
	};

	// ===========================================================================
	// Google Sign In Handler
	// ===========================================================================

	const handleGoogleSignIn = async () => {
		setIsGoogleLoading(true);
		try {
			await authClient.signIn.social({
				provider: "google",
				callbackURL: window.location.origin,
			});
		} catch (error) {
			toast.error("Failed to sign in with Google");
			setIsGoogleLoading(false);
		}
	};

	// ===========================================================================
	// Form Setup
	// ===========================================================================

	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			password: "",
		},
		validators: {
			onSubmit: signUpSchema,
		},
		onSubmit: async ({ value }) => {
			// First, create the account
			const { error } = await authClient.signUp.email({
				name: value.name,
				email: value.email,
				password: value.password,
			});

			if (error) {
				toast.error(error.message || "Failed to create account");
				return;
			}

			// Store email for OTP verification
			setFormEmail(value.email);

			// Send OTP for email verification
			try {
				await client.v1.auth.sendOTP({ email: value.email });
				setStep("verify");
				toast.success("Check your email for the verification code");
			} catch (otpError) {
				// Account created but OTP failed - still move to verify step
				setStep("verify");
				toast.info("Account created! Click 'Resend' to get verification code");
			}
		},
	});

	// ===========================================================================
	// Render Logic
	// ===========================================================================

	if (isPending) {
		return <Loader />;
	}

	// Redirect if already logged in
	if (session?.user) {
		navigate({ to: "/" });
		return <Loader />;
	}

	// ---------------------------------------------------------------------------
	// OTP Verification Step
	// ---------------------------------------------------------------------------

	if (step === "verify") {
		return (
			<div className="mx-auto mt-10 w-full max-w-md p-6">
				<h1 className="mb-2 text-center font-bold text-3xl">
					Verify Your Email
				</h1>
				<p className="mb-6 text-center text-muted-foreground">
					We sent a 6-digit code to <strong>{formEmail}</strong>
				</p>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="otp">Verification Code</Label>
						<Input
							id="otp"
							type="text"
							inputMode="numeric"
							pattern="[0-9]*"
							value={otp}
							onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
							placeholder="000000"
							className="text-center font-mono text-2xl tracking-[0.5em]"
							maxLength={6}
							autoComplete="one-time-code"
						/>
					</div>

					<Button
						onClick={handleVerifyOTP}
						className="w-full"
						disabled={isVerifying || otp.length !== 6}
					>
						{isVerifying ? "Verifying..." : "Verify Email"}
					</Button>

					<div className="flex items-center justify-between">
						<Button
							variant="ghost"
							onClick={() => {
								setStep("form");
								setOtp("");
							}}
							className="text-muted-foreground"
						>
							Back
						</Button>

						<Button
							variant="ghost"
							onClick={handleResendOTP}
							disabled={isSendingOTP}
							className="text-primary"
						>
							{isSendingOTP ? "Sending..." : "Resend Code"}
						</Button>
					</div>
				</div>
			</div>
		);
	}

	// ---------------------------------------------------------------------------
	// Sign Up Form Step
	// ---------------------------------------------------------------------------

	return (
		<div className="mx-auto mt-10 w-full max-w-md p-6">
			<h1 className="mb-6 text-center font-bold text-3xl">Create Account</h1>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-4"
			>
				{/* Name Field */}
				<form.Field name="name">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Name</Label>
							<Input
								id={field.name}
								name={field.name}
								type="text"
								placeholder="Your full name"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								autoComplete="name"
							/>
							{field.state.meta.errors.map((error) => (
								<p key={error?.message} className="text-red-500 text-sm">
									{error?.message}
								</p>
							))}
						</div>
					)}
				</form.Field>

				{/* Email Field */}
				<form.Field name="email">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Email</Label>
							<Input
								id={field.name}
								name={field.name}
								type="email"
								placeholder="you@example.com"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								autoComplete="email"
							/>
							{field.state.meta.errors.map((error) => (
								<p key={error?.message} className="text-red-500 text-sm">
									{error?.message}
								</p>
							))}
						</div>
					)}
				</form.Field>

				{/* Password Field */}
				<form.Field name="password">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Password</Label>
							<Input
								id={field.name}
								name={field.name}
								type="password"
								placeholder="At least 8 characters"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								autoComplete="new-password"
							/>
							{field.state.meta.errors.map((error) => (
								<p key={error?.message} className="text-red-500 text-sm">
									{error?.message}
								</p>
							))}
						</div>
					)}
				</form.Field>

				{/* Submit Button */}
				<form.Subscribe>
					{(state) => (
						<Button
							type="submit"
							className="w-full"
							disabled={!state.canSubmit || state.isSubmitting}
						>
							{state.isSubmitting ? "Creating account..." : "Sign Up"}
						</Button>
					)}
				</form.Subscribe>
			</form>

			{/* Divider */}
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

				{/* Google Sign Up */}
				<div className="mt-6">
					<Button
						variant="outline"
						className="w-full"
						onClick={handleGoogleSignIn}
						disabled={isGoogleLoading}
					>
						{isGoogleLoading ? (
							"Redirecting..."
						) : (
							<>
								<GoogleIcon className="mr-2 h-4 w-4" />
								Continue with Google
							</>
						)}
					</Button>
				</div>
			</div>

			{/* Switch to Sign In */}
			<div className="mt-4 text-center">
				<Button
					variant="link"
					onClick={onSwitchToSignIn}
					className="text-primary hover:text-primary/80"
				>
					Already have an account? Sign In
				</Button>
			</div>
		</div>
	);
}

// =============================================================================
// Google Icon Component
// =============================================================================

function GoogleIcon({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 24 24" aria-hidden="true">
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
	);
}
