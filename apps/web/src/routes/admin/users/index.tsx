import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { client } from "@/utils/orpc";

export const Route = createFileRoute("/admin/users/")({
	component: UsersList,
});

function UsersList() {
	const [page] = useState(1);
	const limit = 10;

	const { data, isLoading, refetch } = useQuery({
		queryKey: ["users", page],
		queryFn: async () => {
			return await client.v1.user.getUsers({
				limit,
				offset: (page - 1) * limit,
			});
		},
	});

	const deleteMutation = useMutation({
		mutationFn: async (data: { id: string }) => {
			return await client.v1.user.deleteUser(data);
		},
		onSuccess: () => {
			toast.success("User deleted successfully");
			refetch();
		},
		onError: (error: any) => {
			toast.error(`Failed to delete user: ${error.message}`);
		},
	});

	const handleDelete = (id: string) => {
		if (
			confirm(
				"Are you sure you want to delete this user? This action cannot be undone.",
			)
		) {
			// @ts-ignore
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
				<div className="space-y-1">
					<h2 className="font-bold text-3xl tracking-tight">Users</h2>
					<p className="text-muted-foreground">
						Manage users and their roles in the platform.
					</p>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>All Users</CardTitle>
					<CardDescription>
						A list of all users including their name, email, role, and status.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Target</TableHead>
								<TableHead>Verified</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{data?.users.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={6}
										className="h-24 text-center text-muted-foreground"
									>
										No users found.
									</TableCell>
								</TableRow>
							) : (
								data?.users.map((user) => (
									<TableRow key={user._id}>
										<TableCell className="font-medium">{user.name}</TableCell>
										<TableCell>{user.email}</TableCell>
										<TableCell>
											<Badge
												variant="outline"
												className={
													user.role === "admin"
														? "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
														: "border-transparent bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
												}
											>
												{user.role}
											</Badge>
										</TableCell>
										<TableCell>{user.target || "-"}</TableCell>
										<TableCell>
											<Badge
												variant="outline"
												className={
													user.emailVerified
														? "border-transparent bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
														: "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/50"
												}
											>
												{user.emailVerified ? "Verified" : "Unverified"}
											</Badge>
										</TableCell>
										<TableCell className="text-right">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" className="h-8 w-8 p-0">
														<span className="sr-only">Open menu</span>
														<MoreHorizontal className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuLabel>Actions</DropdownMenuLabel>
													<DropdownMenuItem asChild>
														<a
															href={`/admin/users/${user._id ?? ""}/edit`}
															className="flex w-full cursor-pointer items-center"
														>
															<Pencil className="mr-2 h-4 w-4" /> Edit
														</a>
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => handleDelete(user._id ?? "")}
														className="text-destructive focus:text-destructive"
													>
														<Trash2 className="mr-2 h-4 w-4" /> Delete
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
