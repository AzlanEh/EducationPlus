import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ProfileForm() {
	// Placeholder user data - replace with actual user hook
	const user = { name: "John Doe", email: "john@example.com", avatar: "" };
	const [name, setName] = useState(user.name);
	const [email, setEmail] = useState(user.email);

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader>
				<CardTitle>Profile</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex justify-center mb-6">
					<Avatar className="h-20 w-20">
						<AvatarImage src={user.avatar} alt={user.name} />
						<AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
					</Avatar>
				</div>
				<div className="space-y-4">
					<div>
						<Label htmlFor="name">Name</Label>
						<Input id="name" value={name} readOnly placeholder="Your name" />
					</div>
					<div>
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							value={email}
							readOnly
							placeholder="Email"
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
