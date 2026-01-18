import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	ArrowLeft,
	Calendar,
	CheckCircle,
	Copy,
	Eye,
	Film,
	Loader2,
	Pause,
	Play,
	Radio,
	RefreshCw,
	Settings,
	Square,
	Trash2,
	Video,
} from "lucide-react";
import { useEffect, useState } from "react";
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { client, queryClient } from "@/utils/orpc";

export const Route = createFileRoute("/admin/live/$streamId")({
	component: LiveStreamDetail,
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
	scheduledAt?: string;
	startedAt?: string;
	endedAt?: string;
	courseId?: string;
	instructorId: string;
	thumbnailUrl?: string;
	isPublished: boolean;
	hasRecording?: boolean;
	recordingVideoId?: string;
	createdAt: string;
}

function LiveStatusBadge({ status }: { status: LiveStreamStatus }) {
	switch (status) {
		case "running":
			return (
				<Badge
					variant="destructive"
					className="animate-pulse px-3 py-1 text-lg"
				>
					<Radio className="mr-2 h-4 w-4" />
					LIVE
				</Badge>
			);
		case "starting":
			return (
				<Badge variant="secondary" className="px-3 py-1 text-lg">
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					Starting...
				</Badge>
			);
		case "scheduled":
			return (
				<Badge
					variant="outline"
					className="border-blue-500 px-3 py-1 text-blue-500 text-lg"
				>
					<Calendar className="mr-2 h-4 w-4" />
					Scheduled
				</Badge>
			);
		case "not_started":
			return (
				<Badge variant="outline" className="px-3 py-1 text-lg">
					<Play className="mr-2 h-4 w-4" />
					Ready to Start
				</Badge>
			);
		case "ended":
		case "stopped":
			return (
				<Badge variant="secondary" className="px-3 py-1 text-lg">
					<Square className="mr-2 h-4 w-4" />
					Ended
				</Badge>
			);
		default:
			return <Badge variant="outline">{status}</Badge>;
	}
}

function LiveStreamDetail() {
	const { streamId } = Route.useParams();
	const navigate = useNavigate();
	const [isEditing, setIsEditing] = useState(false);
	const [editForm, setEditForm] = useState({
		title: "",
		description: "",
		isPublished: false,
	});
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	// Fetch stream details
	const { data, isLoading, refetch } = useQuery({
		queryKey: ["admin-live-stream", streamId],
		queryFn: async () => {
			return await client.v1.live.get({ id: streamId });
		},
		refetchInterval: (query) => {
			// Poll more frequently when stream is running
			const stream = query.state.data?.liveStream as LiveStreamItem | undefined;
			if (stream?.status === "running" || stream?.status === "starting") {
				return 5000; // 5 seconds
			}
			return 30000; // 30 seconds
		},
	});

	const stream = data?.liveStream as LiveStreamItem | undefined;

	// Sync status from Bunny
	const syncMutation = useMutation({
		mutationFn: async () => {
			return await client.v1.live.syncStatus({ id: streamId });
		},
		onSuccess: (result) => {
			toast.success(`Status: ${result.status}`);
			refetch();
		},
		onError: (error) => {
			toast.error(`Sync failed: ${error.message}`);
		},
	});

	// Update stream
	const updateMutation = useMutation({
		mutationFn: async (data: {
			title?: string;
			description?: string;
			isPublished?: boolean;
		}) => {
			return await client.v1.live.update({ id: streamId, ...data });
		},
		onSuccess: () => {
			toast.success("Stream updated");
			setIsEditing(false);
			queryClient.invalidateQueries({
				queryKey: ["admin-live-stream", streamId],
			});
		},
		onError: (error) => {
			toast.error(`Update failed: ${error.message}`);
		},
	});

	// Start stream
	const startMutation = useMutation({
		mutationFn: async () => {
			return await client.v1.live.start({ id: streamId });
		},
		onSuccess: () => {
			toast.success("Stream marked as starting. Begin broadcasting in OBS!");
			refetch();
		},
		onError: (error) => {
			toast.error(`Failed to start: ${error.message}`);
		},
	});

	// End stream
	const endMutation = useMutation({
		mutationFn: async () => {
			return await client.v1.live.end({ id: streamId });
		},
		onSuccess: () => {
			toast.success("Stream ended");
			refetch();
		},
		onError: (error) => {
			toast.error(`Failed to end: ${error.message}`);
		},
	});

	// Delete stream
	const deleteMutation = useMutation({
		mutationFn: async () => {
			return await client.v1.live.delete({ id: streamId });
		},
		onSuccess: () => {
			toast.success("Stream deleted");
			navigate({ to: "/admin/live" });
		},
		onError: (error) => {
			toast.error(`Delete failed: ${error.message}`);
		},
	});

	// Set edit form when stream loads
	useEffect(() => {
		if (stream) {
			setEditForm({
				title: stream.title,
				description: stream.description || "",
				isPublished: stream.isPublished,
			});
		}
	}, [stream]);

	const handleCopyToClipboard = (text: string, label: string) => {
		navigator.clipboard.writeText(text);
		toast.success(`${label} copied to clipboard`);
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-12">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!stream) {
		return (
			<div className="p-6">
				<div className="py-12 text-center">
					<p className="text-muted-foreground">Live stream not found</p>
					<Button
						variant="outline"
						className="mt-4"
						onClick={() => navigate({ to: "/admin/live" })}
					>
						Back to Live Streams
					</Button>
				</div>
			</div>
		);
	}

	const isLive = stream.status === "running" || stream.status === "starting";
	const canStart =
		stream.status === "not_started" || stream.status === "scheduled";
	const canEnd = isLive;
	const canDelete = !isLive;

	return (
		<div className="space-y-6 p-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => navigate({ to: "/admin/live" })}
				>
					<ArrowLeft className="h-5 w-5" />
				</Button>
				<div className="flex-1">
					<h1 className="font-bold text-2xl">{stream.title}</h1>
					{stream.description && (
						<p className="text-muted-foreground">{stream.description}</p>
					)}
				</div>
				<LiveStatusBadge status={stream.status} />
			</div>

			{/* Main Content */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Left Column - Stream Preview & Controls */}
				<div className="space-y-6">
					{/* Live Preview */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Eye className="h-5 w-5" />
								Stream Preview
							</CardTitle>
						</CardHeader>
						<CardContent>
							{isLive && stream.playbackUrl ? (
								<div className="aspect-video overflow-hidden rounded-lg bg-black">
									<iframe
										src={`https://iframe.mediadelivery.net/embed/${stream.bunnyStreamId}?autoplay=true`}
										className="h-full w-full"
										allow="autoplay; fullscreen"
										allowFullScreen
									/>
								</div>
							) : (
								<div className="flex aspect-video items-center justify-center rounded-lg bg-muted">
									<div className="text-center text-muted-foreground">
										<Radio className="mx-auto mb-2 h-12 w-12 opacity-50" />
										<p>Stream is not live</p>
										{canStart && (
											<p className="text-sm">
												Click "Start Stream" and begin broadcasting in OBS
											</p>
										)}
									</div>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Stream Controls */}
					<Card>
						<CardHeader>
							<CardTitle>Stream Controls</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex gap-2">
								{canStart && (
									<Button
										onClick={() => startMutation.mutate()}
										disabled={startMutation.isPending}
									>
										{startMutation.isPending ? (
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										) : (
											<Play className="mr-2 h-4 w-4" />
										)}
										Start Stream
									</Button>
								)}
								{canEnd && (
									<Button
										variant="destructive"
										onClick={() => endMutation.mutate()}
										disabled={endMutation.isPending}
									>
										{endMutation.isPending ? (
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										) : (
											<Square className="mr-2 h-4 w-4" />
										)}
										End Stream
									</Button>
								)}
								<Button
									variant="outline"
									onClick={() => syncMutation.mutate()}
									disabled={syncMutation.isPending}
								>
									{syncMutation.isPending ? (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									) : (
										<RefreshCw className="mr-2 h-4 w-4" />
									)}
									Sync Status
								</Button>
							</div>

							{/* Publishing */}
							<div className="flex items-center justify-between border-t pt-4">
								<div>
									<Label>Published</Label>
									<p className="text-muted-foreground text-sm">
										Make this stream visible to students
									</p>
								</div>
								<Switch
									checked={stream.isPublished}
									onCheckedChange={(checked) =>
										updateMutation.mutate({ isPublished: checked })
									}
								/>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Right Column - Details & Credentials */}
				<div className="space-y-6">
					{/* RTMP Credentials */}
					<Card>
						<CardHeader>
							<CardTitle>Broadcasting Credentials</CardTitle>
							<CardDescription>
								Use these in OBS Studio or other streaming software
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label>RTMP Server URL</Label>
								<div className="flex items-center gap-2">
									<Input readOnly value={stream.rtmpUrl || "Not available"} />
									<Button
										variant="outline"
										size="icon"
										onClick={() =>
											handleCopyToClipboard(stream.rtmpUrl || "", "RTMP URL")
										}
									>
										<Copy className="h-4 w-4" />
									</Button>
								</div>
							</div>
							<div className="space-y-2">
								<Label>Stream Key</Label>
								<div className="flex items-center gap-2">
									<Input
										readOnly
										type="password"
										value={stream.rtmpKey || "Not available"}
									/>
									<Button
										variant="outline"
										size="icon"
										onClick={() =>
											handleCopyToClipboard(stream.rtmpKey || "", "Stream Key")
										}
									>
										<Copy className="h-4 w-4" />
									</Button>
								</div>
								<p className="text-muted-foreground text-xs">
									Keep this secret - don't share publicly
								</p>
							</div>
							<div className="space-y-2">
								<Label>Playback URL (HLS)</Label>
								<div className="flex items-center gap-2">
									<Input
										readOnly
										value={stream.playbackUrl || "Not available"}
									/>
									<Button
										variant="outline"
										size="icon"
										onClick={() =>
											handleCopyToClipboard(
												stream.playbackUrl || "",
												"Playback URL",
											)
										}
									>
										<Copy className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Stream Info */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center justify-between">
								Stream Details
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setIsEditing(!isEditing)}
								>
									<Settings className="h-4 w-4" />
								</Button>
							</CardTitle>
						</CardHeader>
						<CardContent>
							{isEditing ? (
								<div className="space-y-4">
									<div className="space-y-2">
										<Label>Title</Label>
										<Input
											value={editForm.title}
											onChange={(e) =>
												setEditForm({ ...editForm, title: e.target.value })
											}
										/>
									</div>
									<div className="space-y-2">
										<Label>Description</Label>
										<Textarea
											value={editForm.description}
											onChange={(e) =>
												setEditForm({
													...editForm,
													description: e.target.value,
												})
											}
										/>
									</div>
									<div className="flex gap-2">
										<Button
											onClick={() =>
												updateMutation.mutate({
													title: editForm.title,
													description: editForm.description,
												})
											}
											disabled={updateMutation.isPending}
										>
											{updateMutation.isPending && (
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											)}
											Save
										</Button>
										<Button
											variant="outline"
											onClick={() => setIsEditing(false)}
										>
											Cancel
										</Button>
									</div>
								</div>
							) : (
								<dl className="space-y-3 text-sm">
									<div className="flex justify-between">
										<dt className="text-muted-foreground">Stream ID</dt>
										<dd className="font-mono text-xs">
											{stream.bunnyStreamId}
										</dd>
									</div>
									<div className="flex justify-between">
										<dt className="text-muted-foreground">Created</dt>
										<dd>{new Date(stream.createdAt).toLocaleString()}</dd>
									</div>
									{stream.scheduledAt && (
										<div className="flex justify-between">
											<dt className="text-muted-foreground">Scheduled</dt>
											<dd>{new Date(stream.scheduledAt).toLocaleString()}</dd>
										</div>
									)}
									{stream.startedAt && (
										<div className="flex justify-between">
											<dt className="text-muted-foreground">Started</dt>
											<dd>{new Date(stream.startedAt).toLocaleString()}</dd>
										</div>
									)}
									{stream.endedAt && (
										<div className="flex justify-between">
											<dt className="text-muted-foreground">Ended</dt>
											<dd>{new Date(stream.endedAt).toLocaleString()}</dd>
										</div>
									)}
								</dl>
							)}
						</CardContent>
					</Card>

					{/* Recording Section (shown when stream has ended) */}
					{(stream.status === "ended" || stream.status === "stopped") && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Film className="h-5 w-5" />
									Recording
								</CardTitle>
								<CardDescription>
									Live stream recording saved automatically
								</CardDescription>
							</CardHeader>
							<CardContent>
								{stream.hasRecording && stream.recordingVideoId ? (
									<div className="space-y-3">
										<div className="flex items-center gap-2 text-green-600">
											<CheckCircle className="h-5 w-5" />
											<span className="font-medium">Recording available</span>
										</div>
										<p className="text-muted-foreground text-sm">
											The live stream recording has been saved and can be viewed
											in the Videos section.
										</p>
										<Button variant="outline" asChild>
											<Link
												to="/admin/videos"
												className="flex items-center gap-2"
											>
												<Video className="h-4 w-4" />
												View in Videos
											</Link>
										</Button>
									</div>
								) : (
									<div className="space-y-3">
										<p className="text-muted-foreground text-sm">
											No recording linked yet. Recordings are automatically
											created when the stream ends with auto-record enabled.
										</p>
										<p className="text-muted-foreground text-xs">
											If you have a Bunny video ID for the recording, you can
											manually link it via the API.
										</p>
									</div>
								)}
							</CardContent>
						</Card>
					)}

					{/* Danger Zone */}
					<Card className="border-destructive">
						<CardHeader>
							<CardTitle className="text-destructive">Danger Zone</CardTitle>
						</CardHeader>
						<CardContent>
							<Button
								variant="destructive"
								onClick={() => setShowDeleteDialog(true)}
								disabled={!canDelete}
							>
								<Trash2 className="mr-2 h-4 w-4" />
								Delete Stream
							</Button>
							{!canDelete && (
								<p className="mt-2 text-muted-foreground text-sm">
									Cannot delete a live stream while it's running
								</p>
							)}
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Delete Confirmation Dialog */}
			<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Live Stream</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete "{stream.title}"? This action
							cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowDeleteDialog(false)}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() => deleteMutation.mutate()}
							disabled={deleteMutation.isPending}
						>
							{deleteMutation.isPending && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
