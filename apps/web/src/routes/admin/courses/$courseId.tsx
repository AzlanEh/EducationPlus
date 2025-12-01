import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/courses/$courseId")({
	component: CourseEditor,
});

function CourseEditor() {
	const { courseId } = Route.useParams();
	const _navigate = useNavigate();

	// Fetch Course
	const {
		data: course,
		isLoading: isCourseLoading,
		refetch: refetchCourse,
	} = orpc.getCourse.useQuery({
		id: courseId,
	});

	// Fetch Videos
	const {
		data: videosData,
		isLoading: isVideosLoading,
		refetch: refetchVideos,
	} = orpc.getVideos.useQuery({
		courseId,
		limit: 100,
	});

	// Mutations
	const updateCourseMutation = orpc.updateCourse.useMutation({
		onSuccess: () => {
			toast.success("Course updated successfully");
			refetchCourse();
		},
		onError: (err) => toast.error(err.message),
	});

	const createVideoMutation = orpc.createVideo.useMutation({
		onSuccess: () => {
			toast.success("Video added successfully");
			setNewVideo({ title: "", youtubeVideoId: "" });
			refetchVideos();
		},
		onError: (err) => toast.error(err.message),
	});

	const deleteVideoMutation = orpc.deleteVideo.useMutation({
		onSuccess: () => {
			toast.success("Video deleted");
			refetchVideos();
		},
		onError: (err) => toast.error(err.message),
	});

	const [newVideo, setNewVideo] = useState({ title: "", youtubeVideoId: "" });

	if (isCourseLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (!course) {
		return <div>Course not found</div>;
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="outline" size="icon" asChild>
					<Link to="/admin/courses">
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<div>
					<h2 className="font-bold text-2xl tracking-tight">{course.title}</h2>
					<p className="text-muted-foreground">Manage course content</p>
				</div>
			</div>

			<Tabs defaultValue="details">
				<TabsList>
					<TabsTrigger value="details">Details</TabsTrigger>
					<TabsTrigger value="videos">Videos</TabsTrigger>
					<TabsTrigger value="notes">Notes</TabsTrigger>
				</TabsList>

				<TabsContent value="details" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Course Details</CardTitle>
							<CardDescription>
								Update basic course information.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form
								onSubmit={(e) => {
									e.preventDefault();
									const formData = new FormData(e.currentTarget);
									updateCourseMutation.mutate({
										id: courseId,
										title: formData.get("title") as string,
										description: formData.get("description") as string,
										isPublished: formData.get("isPublished") === "on",
									});
								}}
								className="space-y-4"
							>
								<div className="space-y-2">
									<Label htmlFor="title">Title</Label>
									<Input
										id="title"
										name="title"
										defaultValue={course.title}
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="description">Description</Label>
									<Input
										id="description"
										name="description"
										defaultValue={course.description}
										required
									/>
								</div>
								<div className="flex items-center gap-2">
									<input
										type="checkbox"
										id="isPublished"
										name="isPublished"
										defaultChecked={course.isPublished}
										className="h-4 w-4"
									/>
									<Label htmlFor="isPublished">Published</Label>
								</div>
								<Button type="submit" disabled={updateCourseMutation.isPending}>
									{updateCourseMutation.isPending
										? "Saving..."
										: "Save Changes"}
								</Button>
							</form>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="videos" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Add Video</CardTitle>
							<CardDescription>
								Add a YouTube video to this course.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex items-end gap-4">
								<div className="flex-1 space-y-2">
									<Label>Video Title</Label>
									<Input
										value={newVideo.title}
										onChange={(e) =>
											setNewVideo({ ...newVideo, title: e.target.value })
										}
										placeholder="Introduction to React"
									/>
								</div>
								<div className="flex-1 space-y-2">
									<Label>YouTube ID</Label>
									<Input
										value={newVideo.youtubeVideoId}
										onChange={(e) =>
											setNewVideo({
												...newVideo,
												youtubeVideoId: e.target.value,
											})
										}
										placeholder="dQw4w9WgXcQ"
									/>
								</div>
								<Button
									onClick={() => {
										if (!newVideo.title || !newVideo.youtubeVideoId)
											return toast.error("Fill all fields");
										createVideoMutation.mutate({
											courseId,
											title: newVideo.title,
											youtubeVideoId: newVideo.youtubeVideoId,
											order: (videosData?.videos.length || 0) + 1,
											isPublished: true,
										});
									}}
									disabled={createVideoMutation.isPending}
								>
									<Plus className="mr-2 h-4 w-4" /> Add
								</Button>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Videos List</CardTitle>
						</CardHeader>
						<CardContent>
							{isVideosLoading ? (
								<Loader2 className="animate-spin" />
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Order</TableHead>
											<TableHead>Title</TableHead>
											<TableHead>YouTube ID</TableHead>
											<TableHead>Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{videosData?.videos.map((video) => (
											<TableRow key={video._id}>
												<TableCell>{video.order}</TableCell>
												<TableCell>{video.title}</TableCell>
												<TableCell className="font-mono text-xs">
													{video.youtubeVideoId}
												</TableCell>
												<TableCell>
													<Button
														variant="ghost"
														size="icon"
														onClick={() => {
															if (confirm("Delete video?"))
																deleteVideoMutation.mutate({ id: video._id });
														}}
													>
														<Trash2 className="h-4 w-4 text-destructive" />
													</Button>
												</TableCell>
											</TableRow>
										))}
										{videosData?.videos.length === 0 && (
											<TableRow>
												<TableCell colSpan={4} className="text-center">
													No videos yet.
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="notes">
					<Card>
						<CardHeader>
							<CardTitle>Notes</CardTitle>
							<CardDescription>Coming soon...</CardDescription>
						</CardHeader>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
