import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/utils/orpc";

export function SignIn() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleLogin() {
		setIsLoading(true);
		setError(null);

		await authClient.signIn.email(
			{
				email,
				password,
			},
			{
				onError(error) {
					setError(error.error?.message || "Failed to sign in");
					setIsLoading(false);
				},
				onSuccess() {
					setEmail("");
					setPassword("");
					queryClient.refetchQueries();
				},
				onFinished() {
					setIsLoading(false);
				},
			},
		);
	}

	async function handleGoogleSignIn() {
		setIsGoogleLoading(true);
		setError(null);

		await authClient.signIn.social(
			{
				provider: "google",
			},
			{
				onError(error) {
					setError(error.error?.message || "Failed to sign in with Google");
					setIsGoogleLoading(false);
				},
				onSuccess() {
					queryClient.refetchQueries();
				},
				onFinished() {
					setIsGoogleLoading(false);
				},
			},
		);
	}

	return (
		<Card className="mx-auto w-full max-w-md">
			<CardHeader>
				<CardTitle>Sign In</CardTitle>
			</CardHeader>
			<CardContent>
				{error && (
					<Alert variant="destructive" className="mb-4">
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				<div className="space-y-4">
					<Input
						type="email"
						placeholder="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						disabled={isLoading || isGoogleLoading}
					/>

					<Input
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						disabled={isLoading || isGoogleLoading}
					/>

					<Button
						onClick={handleLogin}
						disabled={isLoading || isGoogleLoading}
						className="w-full"
					>
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Signing In...
							</>
						) : (
							"Sign In"
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
						onClick={handleGoogleSignIn}
						disabled={isLoading || isGoogleLoading}
						className="w-full"
					>
						{isGoogleLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Signing In with Google...
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
