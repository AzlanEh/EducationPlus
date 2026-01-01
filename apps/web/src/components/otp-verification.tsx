import { useNavigate, useSearch } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { client } from "@/utils/orpc";

export function OTPVerification() {
	const [otp, setOtp] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const search = useSearch({ from: "/otp-verification" }) as { email: string };
	const email = search.email;
	const navigate = useNavigate();

	async function handleVerifyOTP() {
		if (!otp) {
			setError("Please enter the OTP");
			return;
		}

		if (!email) {
			setError("Email is required");
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const result = await (client as any).v1.auth.verifyOTP({ email, otp });
			if (!result.success) {
				throw new Error(result.error || "Invalid OTP");
			}

			// Success - navigate to sign-in
			navigate({ to: "/sign-in" });
		} catch (err: unknown) {
			const error = err as { message?: string };
			setError(error?.message || "Invalid OTP");
		} finally {
			setIsLoading(false);
		}
	}

	async function handleResendOTP() {
		if (!email) return;

		setIsLoading(true);
		setError(null);

		try {
			await (client as any).v1.auth.sendOTP({ email });
			// Show success message
		} catch (err: unknown) {
			const error = err as { message?: string };
			setError(error?.message || "Failed to resend OTP");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<Card className="mx-auto w-full max-w-md">
			<CardHeader>
				<CardTitle>Verify Your Email</CardTitle>
			</CardHeader>
			<CardContent>
				{error && (
					<Alert variant="destructive" className="mb-4">
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				<p className="mb-4 text-center text-muted-foreground">
					We've sent a verification code to {email}
				</p>

				<div className="space-y-4">
					<Input
						type="text"
						placeholder="000000"
						value={otp}
						onChange={(e) => setOtp(e.target.value)}
						maxLength={6}
						className="text-center text-xl tracking-widest"
						disabled={isLoading}
					/>

					<Button
						onClick={handleVerifyOTP}
						disabled={isLoading}
						className="w-full"
					>
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Verifying...
							</>
						) : (
							"Verify Email"
						)}
					</Button>

					<Button
						variant="ghost"
						onClick={handleResendOTP}
						disabled={isLoading}
						className="w-full"
					>
						Resend OTP
					</Button>

					<Button
						variant="ghost"
						onClick={() => (navigate as any)({ to: "/sign-up" })}
						className="w-full"
					>
						Back to Sign Up
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
