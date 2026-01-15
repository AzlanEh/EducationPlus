import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	Calendar,
	CheckCircle,
	Circle,
	Copy,
	ExternalLink,
	Loader2,
	MoreHorizontal,
	Play,
	Plus,
	Radio,
	RefreshCw,
	Square,
	Trash2,
	Video,
} from "lucide-react";
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
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { client, queryClient } from "@/utils/orpc";

export const Route = createFileRoute("/admin/live/")({
	component: LiveStreamManagement,
});

type LiveStreamStatus =
	| "scheduled"
	| "not_started"
	| "starting"
	| "running"
	| "stopping"
	| "stopped"
	| "ended";

interface LiveStreamItem {
	_id: string;
	title: string;
	description?: string;
	bunnyStreamId: string;
	rtmpUrl?: string;
	rtmpKey?: string;
	playbackUrl?: string;
	status: LiveStreamStatus;
	scheduledAt?: string | Date;
	startedAt?: string | Date;
	endedAt?: string | Date;
	courseId?: string;
	instructorId: string;
	thumbnailUrl?: string;
	isPublished: boolean;
	createdAt: string | Date;
}

// Live stream status badge component
function LiveStatusBadge({ status }: { status: LiveStreamStatus }) {
	switch (status) {
		case "running":
			return (
				<Badge variant="destructive" className="animate-pulse">
					<Radio className="mr-1 h-3 w-3" />
					LIVE
				</Badge>
			);
		case "starting":
			return (
				<Badge variant="secondary">
					<Loader2 className="mr-1 h-3 w-3 animate-spin" />
					Starting
				</Badge>
			);
		case "scheduled":
			return (
				<Badge variant="outline" className="border-blue-500 text-blue-500">
					<Calendar className="mr-1 h-3 w-3" />
					Scheduled
				</Badge>
			);
		case "not_started":
			return (
				<Badge variant="outline">
					<Circle className="mr-1 h-3 w-3" />
					Not Started
				</Badge>
			);
		case "stopping":
			return (
				<Badge variant="secondary">
					<Loader2 className="mr-1 h-3 w-3 animate-spin" />
					Stopping
				</Badge>
			);
		case "stopped":
		case "ended":
			return (
				<Badge variant="secondary">
					<Square className="mr-1 h-3 w-3" />
					Ended
				</Badge>
			);
		default:
			return (
				<Badge variant="outline">
					<Circle className="mr-1 h-3 w-3" />
					{status}
				</Badge>
			);
	}
}

function formatDate(dateValue: string | Date | undefined): string {
	if (!dateValue) return "-";
	return new Date(dateValue).toLocaleString();
}

function LiveStreamManagement() {
	const navigate = useNavigate();
	const [statusFilter, setStatusFilter] = useState<LiveStreamStatus | "all">(
		"all",
	);
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [newStream, setNewStream] = useState({
		title: "",
		description: "",
		scheduledAt: "",
	});
	const [streamDetails, setStreamDetails] = useState<LiveStreamItem | null>(
		null,
	);

	// Fetch live streams
	const { data, isLoading, refetch } = useQuery({
		queryKey: ["admin-live-streams", statusFilter],
		queryFn: async () => {
			return await client.v1.live.list({
				status: statusFilter === "all" ? undefined : statusFilter,
				limit: 100,
			});
		},
	});

	// Fetch stats
	const { data: statsData } = useQuery({
		queryKey: ["admin-live-stats"],
		queryFn: async () => {
			return await client.v1.live.getStats();
		},
	});

	// Create mutation
	const createMutation = useMutation({
		mutationFn: async (data: {
			title: string;
			description?: string;
			scheduledAt?: string;
		}) => {
			return await client.v1.live.create({
				title: data.title,
				description: data.description || undefined,
				scheduledAt: data.scheduledAt || undefined,
			});
		},
		onSuccess: (result) => {
			toast.success("Live stream created!");
			setIsCreateOpen(false);
			setNewStream({ title: "", description: "", scheduledAt: "" });
			queryClient.invalidateQueries({ queryKey: ["admin-live-streams"] });
			queryClient.invalidateQueries({ queryKey: ["admin-live-stats"] });
			// Navigate to stream details
			if (result.id) {
				navigate({
					to: "/admin/live/$streamId",
					params: { streamId: result.id },
				});
			}
		},
		onError: (error) => {
			toast.error(`Failed to create stream: ${error.message}`);
		},
	});

	// Delete mutation
	const deleteMutation = useMutation({
		mutationFn: async (id: string) => {
			return await client.v1.live.delete({ id });
		},
		onSuccess: () => {
			toast.success("Live stream deleted");
			queryClient.invalidateQueries({ queryKey: ["admin-live-streams"] });
			queryClient.invalidateQueries({ queryKey: ["admin-live-stats"] });
		},
		onError: (error) => {
			toast.error(`Failed to delete: ${error.message}`);
		},
	});

	// End stream mutation
	const endMutation = useMutation({
		mutationFn: async (id: string) => {
			return await client.v1.live.end({ id });
		},
		onSuccess: () => {
			toast.success("Stream ended");
			queryClient.invalidateQueries({ queryKey: ["admin-live-streams"] });
			queryClient.invalidateQueries({ queryKey: ["admin-live-stats"] });
		},
		onError: (error) => {
			toast.error(`Failed to end stream: ${error.message}`);
		},
	});

	// Get stream details mutation (to show RTMP key)
	const getDetailsMutation = useMutation({
		mutationFn: async (id: string) => {
			return await client.v1.live.get({ id });
		},
		onSuccess: (result) => {
			setStreamDetails(result.liveStream as LiveStreamItem);
		},
	});

	const liveStreams = (data?.liveStreams || []) as LiveStreamItem[];
	const stats = statsData || { total: 0, scheduled: 0, active: 0, ended: 0 };

	const handleCopyToClipboard = (text: string, label: string) => {
		navigator.clipboard.writeText(text);
		toast.success(`${label} copied to clipboard`);
	};

	return (
		<div className="space-y-6 p-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl">Live Streams</h1>
					<p className="text-muted-foreground">
						Create and manage live streaming sessions
					</p>
				</div>
				<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="mr-2 h-4 w-4" />
							New Live Stream
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create Live Stream</DialogTitle>
							<DialogDescription>
								Set up a new live streaming session. You'll get RTMP credentials
								for OBS or other broadcasting software.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<Label htmlFor="title">Title</Label>
								<Input
									id="title"
									placeholder="e.g., Physics Live Class - Week 5"
									value={newStream.title}
									onChange={(e) =>
										setNewStream({ ...newStream, title: e.target.value })
									}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="description">Description (optional)</Label>
								<Textarea
									id="description"
									placeholder="Brief description of this live session..."
									value={newStream.description}
									onChange={(e) =>
										setNewStream({ ...newStream, description: e.target.value })
									}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="scheduledAt">Scheduled Time (optional)</Label>
								<Input
									id="scheduledAt"
									type="datetime-local"
									value={newStream.scheduledAt}
									onChange={(e) =>
										setNewStream({ ...newStream, scheduledAt: e.target.value })
									}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setIsCreateOpen(false)}>
								Cancel
							</Button>
							<Button
								onClick={() => createMutation.mutate(newStream)}
								disabled={!newStream.title || createMutation.isPending}
							>
								{createMutation.isPending && (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								Create Stream
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="font-medium text-sm">Total Streams</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">{stats.total}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="font-medium text-sm">Scheduled</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl text-blue-500">
							{stats.scheduled}
						</div>
					</CardContent>
				</Card>
				<Card className={stats.active > 0 ? "border-red-500" : ""}>
					<CardHeader className="pb-2">
						<CardTitle className="font-medium text-sm">Live Now</CardTitle>
					</CardHeader>
					<CardContent>
						<div
							className={`font-bold text-2xl ${stats.active > 0 ? "animate-pulse text-red-500" : ""}`}
						>
							{stats.active}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="font-medium text-sm">Ended</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl text-muted-foreground">
							{stats.ended}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Filters */}
			<Card>
				<CardHeader>
					<CardTitle>All Live Streams</CardTitle>
					<CardDescription>Manage your live streaming sessions</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="mb-4 flex items-center gap-4">
						<Select
							value={statusFilter}
							onValueChange={(v) =>
								setStatusFilter(v as LiveStreamStatus | "all")
							}
						>
							<SelectTrigger className="w-48">
								<SelectValue placeholder="Filter by status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Statuses</SelectItem>
								<SelectItem value="scheduled">Scheduled</SelectItem>
								<SelectItem value="not_started">Not Started</SelectItem>
								<SelectItem value="running">Live Now</SelectItem>
								<SelectItem value="ended">Ended</SelectItem>
							</SelectContent>
						</Select>
						<Button variant="outline" size="icon" onClick={() => refetch()}>
							<RefreshCw className="h-4 w-4" />
						</Button>
					</div>

					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
						</div>
					) : liveStreams.length === 0 ? (
						<div className="py-8 text-center text-muted-foreground">
							<Video className="mx-auto mb-2 h-12 w-12 opacity-50" />
							<p>No live streams found</p>
							<Button
								variant="outline"
								className="mt-4"
								onClick={() => setIsCreateOpen(true)}
							>
								<Plus className="mr-2 h-4 w-4" />
								Create your first stream
							</Button>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Title</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Scheduled</TableHead>
									<TableHead>Created</TableHead>
									<TableHead>Published</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{liveStreams.map((stream) => (
									<TableRow key={stream._id}>
										<TableCell>
											<div className="font-medium">{stream.title}</div>
											{stream.description && (
												<div className="max-w-xs truncate text-muted-foreground text-sm">
													{stream.description}
												</div>
											)}
										</TableCell>
										<TableCell>
											<LiveStatusBadge status={stream.status} />
										</TableCell>
										<TableCell>
											{stream.scheduledAt
												? formatDate(stream.scheduledAt)
												: "-"}
										</TableCell>
										<TableCell>{formatDate(stream.createdAt)}</TableCell>
										<TableCell>
											{stream.isPublished ? (
												<Badge variant="default">Published</Badge>
											) : (
												<Badge variant="outline">Draft</Badge>
											)}
										</TableCell>
										<TableCell className="text-right">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="icon">
														<MoreHorizontal className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuLabel>Actions</DropdownMenuLabel>
													<DropdownMenuItem
														onClick={() =>
															navigate({
																to: "/admin/live/$streamId",
																params: { streamId: stream._id },
															})
														}
													>
														<ExternalLink className="mr-2 h-4 w-4" />
														View Details
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() =>
															getDetailsMutation.mutate(stream._id)
														}
													>
														<Copy className="mr-2 h-4 w-4" />
														Show RTMP Credentials
													</DropdownMenuItem>
													{(stream.status === "running" ||
														stream.status === "starting") && (
														<DropdownMenuItem
															onClick={() => endMutation.mutate(stream._id)}
															className="text-orange-600"
														>
															<Square className="mr-2 h-4 w-4" />
															End Stream
														</DropdownMenuItem>
													)}
													<DropdownMenuSeparator />
													<DropdownMenuItem
														onClick={() => deleteMutation.mutate(stream._id)}
														className="text-destructive"
														disabled={
															stream.status === "running" ||
															stream.status === "starting"
														}
													>
														<Trash2 className="mr-2 h-4 w-4" />
														Delete
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			{/* Stream Details Dialog */}
			<Dialog
				open={!!streamDetails}
				onOpenChange={() => setStreamDetails(null)}
			>
				<DialogContent className="max-w-lg">
					<DialogHeader>
						<DialogTitle>Stream Credentials</DialogTitle>
						<DialogDescription>
							Use these credentials in OBS or other broadcasting software
						</DialogDescription>
					</DialogHeader>
					{streamDetails && (
						<div className="space-y-4">
							<div className="space-y-2">
								<Label>RTMP Server URL</Label>
								<div className="flex items-center gap-2">
									<Input
										readOnly
										value={streamDetails.rtmpUrl || "Not available"}
									/>
									<Button
										variant="outline"
										size="icon"
										onClick={() =>
											handleCopyToClipboard(
												streamDetails.rtmpUrl || "",
												"RTMP URL",
											)
										}
									>
										<Copy className="h-4 w-4" />
									</Button>
								</div>
							</div>
							<div className="space-y-2">
								<Label>Stream Key (Keep Secret!)</Label>
								<div className="flex items-center gap-2">
									<Input
										readOnly
										type="password"
										value={streamDetails.rtmpKey || "Not available"}
									/>
									<Button
										variant="outline"
										size="icon"
										onClick={() =>
											handleCopyToClipboard(
												streamDetails.rtmpKey || "",
												"Stream Key",
											)
										}
									>
										<Copy className="h-4 w-4" />
									</Button>
								</div>
								<p className="text-muted-foreground text-xs">
									Never share your stream key publicly
								</p>
							</div>
							<div className="space-y-2">
								<Label>Playback URL (HLS)</Label>
								<div className="flex items-center gap-2">
									<Input
										readOnly
										value={streamDetails.playbackUrl || "Not available"}
									/>
									<Button
										variant="outline"
										size="icon"
										onClick={() =>
											handleCopyToClipboard(
												streamDetails.playbackUrl || "",
												"Playback URL",
											)
										}
									>
										<Copy className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</div>
					)}
					<DialogFooter>
						<Button variant="outline" onClick={() => setStreamDetails(null)}>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
