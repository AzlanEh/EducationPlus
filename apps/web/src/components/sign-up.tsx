import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";
import { client } from "@/utils/orpc";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignUp() {
	const navigate = useNavigate();

	// Form fields
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [target, setTarget] = useState("");
	const [gender, setGender] = useState("");
	const [phoneNo, setPhoneNo] = useState("");

	const [isLoading, setIsLoading] = useState(false);
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleGoogleSignUp() {
		setIsGoogleLoading(true);
		setError(null);

		await authClient.signIn.social(
			{
				provider: "google",
			},
			{
				onError(error) {
					setError(error.error?.message || "Failed to sign up with Google");
					setIsGoogleLoading(false);
				},
				onSuccess() {
					// Google signin/signup automatically verifies
				},
				onFinished() {
					setIsGoogleLoading(false);
				},
			},
		);
	}

	async function handleSignUp() {
		if (!name || !email || !password || !target || !gender || !phoneNo) {
			setError("All fields are required");
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			await authClient.signUp.email({
				name,
				email,
				password,
				target,
				gender,
				phoneNo,
			} as any);

			// Send OTP via custom API
			await (client as any).v1.auth.sendOTP({ email });

			// Navigate to OTP verification screen
			(navigate as any)({
				to: "/otp-verification",
				search: { email },
			});
		} catch (err: unknown) {
			const error = err as { message?: string };
			setError(error?.message || "Failed to create account");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader>
				<CardTitle>Create Student Account</CardTitle>
			</CardHeader>
			<CardContent>
				{error && (
					<Alert variant="destructive" className="mb-4">
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				<div className="space-y-4">
					<div>
						<Label htmlFor="name">Full Name</Label>
						<Input
							id="name"
							placeholder="Full Name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							disabled={isLoading || isGoogleLoading}
						/>
					</div>

					<div>
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							placeholder="Email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							disabled={isLoading || isGoogleLoading}
						/>
					</div>

					<div>
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							disabled={isLoading || isGoogleLoading}
						/>
					</div>

					<div>
						<Label htmlFor="target">Target</Label>
						<Input
							id="target"
							placeholder="JEE, NEET, 8th, 9th, 10th"
							value={target}
							onChange={(e) => setTarget(e.target.value)}
							disabled={isLoading || isGoogleLoading}
						/>
					</div>

					<div>
						<Label htmlFor="gender">Gender</Label>
						<Input
							id="gender"
							placeholder="male/female/other"
							value={gender}
							onChange={(e) => setGender(e.target.value)}
							disabled={isLoading || isGoogleLoading}
						/>
					</div>

					<div>
						<Label htmlFor="phone">Phone Number</Label>
						<Input
							id="phone"
							type="tel"
							placeholder="Phone Number"
							value={phoneNo}
							onChange={(e) => setPhoneNo(e.target.value)}
							disabled={isLoading || isGoogleLoading}
						/>
					</div>

					<Button
						onClick={handleSignUp}
						disabled={isLoading || isGoogleLoading}
						className="w-full"
					>
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Creating Account...
							</>
						) : (
							"Create Account"
						)}
					</Button>

					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-background px-2 text-muted-foreground">
								Or
							</span>
						</div>
					</div>

					<Button
						variant="outline"
						onClick={handleGoogleSignUp}
						disabled={isLoading || isGoogleLoading}
						className="w-full"
					>
						{isGoogleLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Signing Up with Google...
							</>
						) : (
							"Continue with Google"
						)}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
