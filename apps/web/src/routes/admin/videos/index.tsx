import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	CheckCircle,
	Clock,
	ExternalLink,
	Film,
	Loader2,
	MoreHorizontal,
	Play,
	Search,
	Trash2,
	XCircle,
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
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
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
import { client, queryClient } from "@/utils/orpc";

export const Route = createFileRoute("/admin/videos/")({
	component: VideosManagement,
});

type VideoStatus = "pending" | "uploading" | "processing" | "ready" | "error";

interface VideoItem {
	id: string;
	title: string;
	description?: string;
	status?: VideoStatus;
	duration?: number;
	thumbnailUrl?: string;
	playbackUrl?: string;
	embedUrl?: string;
	courseId: string;
	isPublished: boolean;
	isLive?: boolean;
	createdAt?: Date;
}

// Helper function to format video duration
function formatDuration(seconds: number): string {
	const hrs = Math.floor(seconds / 3600);
	const mins = Math.floor((seconds % 3600) / 60);
	const secs = Math.floor(seconds % 60);

	if (hrs > 0) {
		return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
	}
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Video status badge component
function VideoStatusBadge({ status }: { status: VideoStatus | undefined }) {
	switch (status) {
		case "ready":
			return (
				<Badge variant="default" className="bg-green-500">
					<CheckCircle className="mr-1 h-3 w-3" />
					Ready
				</Badge>
			);
		case "processing":
			return (
				<Badge variant="secondary">
					<Loader2 className="mr-1 h-3 w-3 animate-spin" />
					Processing
				</Badge>
			);
		case "uploading":
			return (
				<Badge variant="secondary">
					<Loader2 className="mr-1 h-3 w-3 animate-spin" />
					Uploading
				</Badge>
			);
		case "error":
			return (
				<Badge variant="destructive">
					<XCircle className="mr-1 h-3 w-3" />
					Error
				</Badge>
			);
		case "pending":
		default:
			return (
				<Badge variant="outline">
					<Clock className="mr-1 h-3 w-3" />
					Pending
				</Badge>
			);
	}
}

function VideosManagement() {
	const [statusFilter, setStatusFilter] = useState<VideoStatus | "all">("all");
	const [search, setSearch] = useState("");
	const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
	const [previewVideo, setPreviewVideo] = useState<{
		embedUrl: string;
		title: string;
	} | null>(null);

	const { data, isLoading, refetch } = useQuery({
		queryKey: ["admin-videos", statusFilter, search],
		queryFn: async () => {
			return await client.v1.video.listAll({
				status: statusFilter === "all" ? undefined : statusFilter,
				search: search || undefined,
				limit: 100,
			});
		},
	});

	const deleteVideoMutation = useMutation({
		mutationFn: async (id: string) => {
			return await client.v1.video.delete({ id });
		},
		onSuccess: () => {
			toast.success("Video deleted");
			refetch();
			queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
		},
		onError: (err: Error) => toast.error(err.message),
	});

	const bulkDeleteMutation = useMutation({
		mutationFn: async (ids: string[]) => {
			// Delete videos sequentially to avoid overwhelming the server
			for (const id of ids) {
				await client.v1.video.delete({ id });
			}
		},
		onSuccess: () => {
			toast.success(`${selectedVideos.size} videos deleted`);
			setSelectedVideos(new Set());
			refetch();
			queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
		},
		onError: (err: Error) => toast.error(err.message),
	});

	const handleSelectAll = (checked: boolean) => {
		if (checked && data?.videos) {
			setSelectedVideos(new Set(data.videos.map((v) => v.id)));
		} else {
			setSelectedVideos(new Set());
		}
	};

	const handleSelectVideo = (id: string, checked: boolean) => {
		const newSelected = new Set(selectedVideos);
		if (checked) {
			newSelected.add(id);
		} else {
			newSelected.delete(id);
		}
		setSelectedVideos(newSelected);
	};

	const handleBulkDelete = () => {
		if (selectedVideos.size === 0) return;
		if (
			confirm(
				`Are you sure you want to delete ${selectedVideos.size} videos? This cannot be undone.`,
			)
		) {
			bulkDeleteMutation.mutate(Array.from(selectedVideos));
		}
	};

	// Stats calculation
	const stats = {
		total: data?.total || 0,
		ready: data?.videos?.filter((v) => v.status === "ready").length || 0,
		processing:
			data?.videos?.filter(
				(v) => v.status === "processing" || v.status === "uploading",
			).length || 0,
		error: data?.videos?.filter((v) => v.status === "error").length || 0,
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="space-y-1">
					<h2 className="font-bold text-3xl tracking-tight">Videos</h2>
					<p className="text-muted-foreground">
						Manage all uploaded videos across courses.
					</p>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Total Videos</CardTitle>
						<Film className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">{stats.total}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Ready</CardTitle>
						<CheckCircle className="h-4 w-4 text-green-500" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl text-green-500">
							{stats.ready}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Processing</CardTitle>
						<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">{stats.processing}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Errors</CardTitle>
						<XCircle className="h-4 w-4 text-destructive" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl text-destructive">
							{stats.error}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Filters & Actions */}
			<Card>
				<CardHeader>
					<CardTitle>All Videos</CardTitle>
					<CardDescription>
						View and manage all videos uploaded to the platform.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex flex-1 items-center gap-2">
							<div className="relative flex-1 sm:max-w-xs">
								<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search videos..."
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									className="pl-9"
								/>
							</div>
							<Select
								value={statusFilter}
								onValueChange={(v) => setStatusFilter(v as VideoStatus | "all")}
							>
								<SelectTrigger className="w-[150px]">
									<SelectValue placeholder="Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Status</SelectItem>
									<SelectItem value="ready">Ready</SelectItem>
									<SelectItem value="processing">Processing</SelectItem>
									<SelectItem value="uploading">Uploading</SelectItem>
									<SelectItem value="pending">Pending</SelectItem>
									<SelectItem value="error">Error</SelectItem>
								</SelectContent>
							</Select>
						</div>
						{selectedVideos.size > 0 && (
							<Button
								variant="destructive"
								size="sm"
								onClick={handleBulkDelete}
								disabled={bulkDeleteMutation.isPending}
							>
								{bulkDeleteMutation.isPending ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<Trash2 className="mr-2 h-4 w-4" />
								)}
								Delete {selectedVideos.size} selected
							</Button>
						)}
					</div>

					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-12">
										<Checkbox
											checked={
												data?.videos &&
												data.videos.length > 0 &&
												selectedVideos.size === data.videos.length
											}
											onCheckedChange={handleSelectAll}
										/>
									</TableHead>
									<TableHead className="w-24">Thumbnail</TableHead>
									<TableHead>Title</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Duration</TableHead>
									<TableHead>Created</TableHead>
									<TableHead className="w-20">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{data?.videos.length === 0 ? (
									<TableRow>
										<TableCell
											colSpan={7}
											className="h-24 text-center text-muted-foreground"
										>
											No videos found.
										</TableCell>
									</TableRow>
								) : (
									data?.videos.map((video) => (
										<TableRow key={video.id}>
											<TableCell>
												<Checkbox
													checked={selectedVideos.has(video.id)}
													onCheckedChange={(checked) =>
														handleSelectVideo(video.id, checked as boolean)
													}
												/>
											</TableCell>
											<TableCell>
												{video.thumbnailUrl ? (
													<img
														src={video.thumbnailUrl}
														alt={video.title}
														className="h-12 w-20 rounded object-cover"
													/>
												) : (
													<div className="flex h-12 w-20 items-center justify-center rounded bg-muted">
														<Play className="h-4 w-4 text-muted-foreground" />
													</div>
												)}
											</TableCell>
											<TableCell>
												<div className="max-w-xs">
													<p className="truncate font-medium">{video.title}</p>
													{video.description && (
														<p className="truncate text-muted-foreground text-xs">
															{video.description}
														</p>
													)}
													{video.isLive && (
														<Badge variant="outline" className="mt-1 text-xs">
															Live Stream
														</Badge>
													)}
												</div>
											</TableCell>
											<TableCell>
												<VideoStatusBadge status={video.status} />
											</TableCell>
											<TableCell>
												{video.duration ? (
													<span className="flex items-center gap-1 text-sm">
														<Clock className="h-3 w-3" />
														{formatDuration(video.duration)}
													</span>
												) : (
													<span className="text-muted-foreground text-sm">
														--
													</span>
												)}
											</TableCell>
											<TableCell className="text-muted-foreground text-sm">
												{video.createdAt
													? new Date(video.createdAt).toLocaleDateString()
													: "--"}
											</TableCell>
											<TableCell>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" className="h-8 w-8 p-0">
															<span className="sr-only">Open menu</span>
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuLabel>Actions</DropdownMenuLabel>
														{video.embedUrl && (
															<DropdownMenuItem
																onClick={() =>
																	setPreviewVideo({
																		embedUrl: video.embedUrl ?? "",
																		title: video.title,
																	})
																}
															>
																<Play className="mr-2 h-4 w-4" />
																Preview
															</DropdownMenuItem>
														)}
														{video.playbackUrl && (
															<DropdownMenuItem
																onClick={() =>
																	window.open(video.playbackUrl, "_blank")
																}
															>
																<ExternalLink className="mr-2 h-4 w-4" />
																Open in new tab
															</DropdownMenuItem>
														)}
														{video.courseId && (
															<DropdownMenuItem asChild>
																<Link
																	to="/admin/courses/$courseId"
																	params={{ courseId: video.courseId }}
																	className="flex w-full cursor-pointer items-center"
																>
																	<Film className="mr-2 h-4 w-4" />
																	Go to course
																</Link>
															</DropdownMenuItem>
														)}
														<DropdownMenuSeparator />
														<DropdownMenuItem
															onClick={() => {
																if (confirm("Delete this video?")) {
																	deleteVideoMutation.mutate(video.id);
																}
															}}
															className="text-destructive focus:text-destructive"
														>
															<Trash2 className="mr-2 h-4 w-4" />
															Delete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					)}

					{/* Pagination info */}
					{data && data.total > 0 && (
						<div className="mt-4 text-muted-foreground text-sm">
							Showing {data.videos.length} of {data.total} videos
						</div>
					)}
				</CardContent>
			</Card>

			{/* Video Preview Dialog */}
			<Dialog open={!!previewVideo} onOpenChange={() => setPreviewVideo(null)}>
				<DialogContent className="max-w-4xl">
					<DialogHeader>
						<DialogTitle>{previewVideo?.title}</DialogTitle>
						<DialogDescription>Video preview</DialogDescription>
					</DialogHeader>
					{previewVideo && (
						<div className="aspect-video">
							<iframe
								src={previewVideo.embedUrl}
								className="h-full w-full rounded-lg"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowFullScreen
							/>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
