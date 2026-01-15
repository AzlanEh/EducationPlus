import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	ArrowLeft,
	CheckCircle,
	Clock,
	Loader2,
	Play,
	Plus,
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
import { VideoUpload } from "@/components/video-upload";
import { client, queryClient } from "@/utils/orpc";

export const Route = createFileRoute("/admin/courses/$courseId")({
	component: CourseEditor,
});

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
function VideoStatusBadge({
	status,
}: {
	status:
		| "pending"
		| "uploading"
		| "processing"
		| "ready"
		| "error"
		| undefined;
}) {
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

function CourseEditor() {
	const { courseId } = Route.useParams();
	const _navigate = useNavigate();

	// Fetch Course
	const {
		data: course,
		isLoading: isCourseLoading,
		refetch: refetchCourse,
	} = useQuery({
		queryKey: ["course", courseId],
		queryFn: async () => {
			return await client.v1.course.getCourse({ id: courseId });
		},
	});

	// Fetch Videos using the new video router
	const {
		data: videosData,
		isLoading: isVideosLoading,
		refetch: refetchVideos,
	} = useQuery({
		queryKey: ["course-videos", courseId],
		queryFn: async () => {
			return await client.v1.video.listByCourse({
				courseId,
				includeUnpublished: true,
				limit: 100,
			});
		},
	});

	// Fetch Notes
	const {
		data: notesData,
		isLoading: isNotesLoading,
		refetch: refetchNotes,
	} = useQuery({
		queryKey: ["course-notes", courseId],
		queryFn: async () => {
			return await client.v1.course.getNotes({
				courseId,
				limit: 100,
			});
		},
	});

	// Fetch DPPs
	const {
		data: dppsData,
		isLoading: isDPPsLoading,
		refetch: refetchDPPs,
	} = useQuery({
		queryKey: ["course-dpps", courseId],
		queryFn: async () => {
			return await client.v1.course.getDPPs({
				courseId,
				limit: 100,
			});
		},
	});

	// Mutations
	const updateCourseMutation = useMutation({
		mutationFn: async (data: any) => {
			return await client.v1.course.updateCourse(data);
		},
		onSuccess: () => {
			toast.success("Course updated successfully");
			refetchCourse();
		},
		onError: (err: Error) => toast.error(err.message),
	});

	// Delete video using the new video router
	const deleteVideoMutation = useMutation({
		mutationFn: async (id: string) => {
			return await client.v1.video.delete({ id });
		},
		onSuccess: () => {
			toast.success("Video deleted");
			refetchVideos();
		},
		onError: (err: Error) => toast.error(err.message),
	});

	const createNoteMutation = useMutation({
		mutationFn: async (data: any) => {
			return await client.v1.course.createNote(data);
		},
		onSuccess: () => {
			toast.success("Note added successfully");
			setNewNote({ title: "", content: "" });
			refetchNotes();
		},
		onError: (err: Error) => toast.error(err.message),
	});

	const deleteNoteMutation = useMutation({
		mutationFn: async (data: any) => {
			return await client.v1.course.deleteNote(data);
		},
		onSuccess: () => {
			toast.success("Note deleted");
			refetchNotes();
		},
		onError: (err: Error) => toast.error(err.message),
	});

	const createDPPMutation = useMutation({
		mutationFn: async (data: any) => {
			return await client.v1.course.createDPP(data);
		},
		onSuccess: () => {
			toast.success("DPP created successfully");
			setNewQuestions([]);
			refetchDPPs();
		},
		onError: (err: Error) => toast.error(err.message),
	});

	const deleteDPPMutation = useMutation({
		mutationFn: async (data: any) => {
			return await client.v1.course.deleteDPP(data);
		},
		onSuccess: () => {
			toast.success("DPP deleted");
			refetchDPPs();
		},
		onError: (err: Error) => toast.error(err.message),
	});

	const [newNote, setNewNote] = useState({ title: "", content: "" });
	const [newQuestions, setNewQuestions] = useState<
		Array<{
			questionText: string;
			options: Array<{ text: string }>;
			correctAnswer: number;
			marks: number;
			explanation: string;
		}>
	>([]);

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
					<TabsTrigger value="dpps">DPPs</TabsTrigger>
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
					{/* Video Upload Component */}
					<VideoUpload
						courseId={courseId}
						onSuccess={() => {
							refetchVideos();
							queryClient.invalidateQueries({
								queryKey: ["course-videos", courseId],
							});
						}}
					/>

					{/* Videos List */}
					<Card>
						<CardHeader>
							<CardTitle>Videos List</CardTitle>
							<CardDescription>
								Manage videos in this course. Videos will be available after
								processing completes.
							</CardDescription>
						</CardHeader>
						<CardContent>
							{isVideosLoading ? (
								<div className="flex items-center justify-center py-8">
									<Loader2 className="h-6 w-6 animate-spin" />
								</div>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="w-24">Thumbnail</TableHead>
											<TableHead>Title</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Duration</TableHead>
											<TableHead className="w-24">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{videosData?.videos.map((video) => (
											<TableRow key={video.id}>
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
												<TableCell className="font-medium">
													{video.title}
													{video.description && (
														<p className="mt-0.5 text-muted-foreground text-xs">
															{video.description}
														</p>
													)}
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
												<TableCell>
													<div className="flex items-center gap-1">
														{video.playbackUrl && (
															<Button
																variant="ghost"
																size="icon"
																onClick={() =>
																	window.open(video.playbackUrl, "_blank")
																}
																title="Preview video"
															>
																<Play className="h-4 w-4" />
															</Button>
														)}
														<Button
															variant="ghost"
															size="icon"
															onClick={() => {
																if (confirm("Delete this video?"))
																	deleteVideoMutation.mutate(video.id);
															}}
															disabled={deleteVideoMutation.isPending}
														>
															<Trash2 className="h-4 w-4 text-destructive" />
														</Button>
													</div>
												</TableCell>
											</TableRow>
										))}
										{videosData?.videos.length === 0 && (
											<TableRow>
												<TableCell
													colSpan={5}
													className="py-8 text-center text-muted-foreground"
												>
													No videos yet. Upload your first video above.
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="notes" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Add Note</CardTitle>
							<CardDescription>Add a note to this course.</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex items-end gap-4">
								<div className="flex-1 space-y-2">
									<Label>Note Title</Label>
									<Input
										value={newNote.title}
										onChange={(e) =>
											setNewNote({ ...newNote, title: e.target.value })
										}
										placeholder="Introduction Notes"
									/>
								</div>
								<Button
									onClick={() => {
										if (!newNote.title || !newNote.content)
											return toast.error("Fill all fields");
										createNoteMutation.mutate({
											courseId,
											title: newNote.title,
											content: newNote.content,
											order: (notesData?.notes.length || 0) + 1,
											isPublished: true,
										});
									}}
									disabled={createNoteMutation.isPending}
								>
									<Plus className="mr-2 h-4 w-4" /> Add
								</Button>
							</div>
							<div className="mt-4 space-y-2">
								<Label>Note Content</Label>
								<textarea
									className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
									value={newNote.content}
									onChange={(e) =>
										setNewNote({ ...newNote, content: e.target.value })
									}
									placeholder="Write your note content here..."
									rows={6}
								/>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Notes List</CardTitle>
						</CardHeader>
						<CardContent>
							{isNotesLoading ? (
								<Loader2 className="animate-spin" />
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Order</TableHead>
											<TableHead>Title</TableHead>
											<TableHead>Content Preview</TableHead>
											<TableHead>Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{notesData?.notes.map((note) => (
											<TableRow key={note._id}>
												<TableCell>{note.order}</TableCell>
												<TableCell>{note.title}</TableCell>
												<TableCell className="max-w-xs truncate">
													{note.content.substring(0, 50)}...
												</TableCell>
												<TableCell>
													<Button
														variant="ghost"
														size="icon"
														onClick={() => {
															if (confirm("Delete note?"))
																deleteNoteMutation.mutate({ id: note._id });
														}}
													>
														<Trash2 className="h-4 w-4 text-destructive" />
													</Button>
												</TableCell>
											</TableRow>
										))}
										{notesData?.notes.length === 0 && (
											<TableRow>
												<TableCell colSpan={4} className="text-center">
													No notes yet.
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="dpps" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Create DPP</CardTitle>
							<CardDescription>
								Create a Daily Practice Problem set for this course.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form
								onSubmit={(e) => {
									e.preventDefault();
									const formData = new FormData(e.currentTarget);
									const title = formData.get("title") as string;
									const description = formData.get("description") as string;
									const date = formData.get("date") as string;
									const subject = formData.get("subject") as string;
									const target = formData.get("target") as string;

									if (
										!title ||
										!date ||
										!subject ||
										!target ||
										newQuestions.length === 0
									) {
										return toast.error(
											"Fill all required fields and add at least one question",
										);
									}

									createDPPMutation.mutate({
										courseId,
										title,
										description,
										date,
										subject,
										target,
										questions: newQuestions,
										isPublished: true,
									});
								}}
								className="space-y-4"
							>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="dpp-title">Title</Label>
										<Input
											id="dpp-title"
											name="title"
											placeholder="DPP 1 - Mechanics"
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="dpp-date">Date</Label>
										<Input id="dpp-date" name="date" type="date" required />
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="dpp-subject">Subject</Label>
										<Input
											id="dpp-subject"
											name="subject"
											placeholder="Physics"
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="dpp-target">Target Exam</Label>
										<Input
											id="dpp-target"
											name="target"
											placeholder="JEE"
											required
										/>
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="dpp-description">
										Description (Optional)
									</Label>
									<Input
										id="dpp-description"
										name="description"
										placeholder="Practice problems for mechanics"
									/>
								</div>

								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<h4 className="font-medium text-sm">Questions</h4>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() =>
												setNewQuestions([
													...newQuestions,
													{
														questionText: "",
														options: [
															{ text: "" },
															{ text: "" },
															{ text: "" },
															{ text: "" },
														],
														correctAnswer: 0,
														marks: 4,
														explanation: "",
													},
												])
											}
										>
											<Plus className="mr-2 h-4 w-4" /> Add Question
										</Button>
									</div>

									{newQuestions.map((question, qIndex) => (
										<Card key={`question-${qIndex}`} className="p-4">
											<div className="space-y-4">
												<div className="flex items-center justify-between">
													<h5 className="font-medium text-sm">
														Question {qIndex + 1}
													</h5>
													<Button
														type="button"
														variant="ghost"
														size="sm"
														onClick={() => {
															const updated = newQuestions.filter(
																(_, i) => i !== qIndex,
															);
															setNewQuestions(updated);
														}}
													>
														<Trash2 className="h-4 w-4 text-destructive" />
													</Button>
												</div>

												<div className="space-y-2">
													<Label>Question Text</Label>
													<textarea
														className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
														value={question.questionText}
														onChange={(e) => {
															const updated = [...newQuestions];
															updated[qIndex].questionText = e.target.value;
															setNewQuestions(updated);
														}}
														placeholder="Enter the question..."
														required
													/>
												</div>

												<div className="space-y-2">
													<Label>Options</Label>
													{question.options.map((option, oIndex) => (
														<div
															key={`option-${qIndex}-${oIndex}`}
															className="flex items-center gap-2"
														>
															<input
																type="radio"
																name={`correct-${qIndex}`}
																checked={question.correctAnswer === oIndex}
																onChange={() => {
																	const updated = [...newQuestions];
																	updated[qIndex].correctAnswer = oIndex;
																	setNewQuestions(updated);
																}}
																className="h-4 w-4"
															/>
															<Input
																value={option.text}
																onChange={(e) => {
																	const updated = [...newQuestions];
																	updated[qIndex].options[oIndex].text =
																		e.target.value;
																	setNewQuestions(updated);
																}}
																placeholder={`Option ${oIndex + 1}`}
																required
															/>
														</div>
													))}
												</div>

												<div className="grid grid-cols-2 gap-4">
													<div className="space-y-2">
														<Label>Marks</Label>
														<Input
															type="number"
															min="1"
															value={question.marks}
															onChange={(e) => {
																const updated = [...newQuestions];
																updated[qIndex].marks =
																	Number.parseInt(e.target.value, 10) || 4;
																setNewQuestions(updated);
															}}
														/>
													</div>
													<div className="space-y-2">
														<Label>Explanation (Optional)</Label>
														<Input
															value={question.explanation}
															onChange={(e) => {
																const updated = [...newQuestions];
																updated[qIndex].explanation = e.target.value;
																setNewQuestions(updated);
															}}
															placeholder="Solution explanation"
														/>
													</div>
												</div>
											</div>
										</Card>
									))}
								</div>

								<Button type="submit" disabled={createDPPMutation.isPending}>
									{createDPPMutation.isPending ? "Creating..." : "Create DPP"}
								</Button>
							</form>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>DPPs List</CardTitle>
						</CardHeader>
						<CardContent>
							{isDPPsLoading ? (
								<Loader2 className="animate-spin" />
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Title</TableHead>
											<TableHead>Date</TableHead>
											<TableHead>Subject</TableHead>
											<TableHead>Questions</TableHead>
											<TableHead>Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{dppsData?.dpps.map((dpp) => (
											<TableRow key={dpp._id}>
												<TableCell>{dpp.title}</TableCell>
												<TableCell>
													{new Date(dpp.date).toLocaleDateString()}
												</TableCell>
												<TableCell>{dpp.subject}</TableCell>
												<TableCell>{dpp.questions.length}</TableCell>
												<TableCell>
													<Button
														variant="ghost"
														size="icon"
														onClick={() => {
															if (confirm("Delete DPP?"))
																deleteDPPMutation.mutate({ id: dpp._id });
														}}
													>
														<Trash2 className="h-4 w-4 text-destructive" />
													</Button>
												</TableCell>
											</TableRow>
										))}
										{dppsData?.dpps.length === 0 && (
											<TableRow>
												<TableCell colSpan={5} className="text-center">
													No DPPs yet.
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
