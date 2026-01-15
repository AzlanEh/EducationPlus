import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	AlertCircle,
	CheckCircle,
	Film,
	Loader2,
	Upload,
	X,
} from "lucide-react";
import { memo, useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import * as tus from "tus-js-client";
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
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { client } from "@/utils/orpc";

interface VideoUploadProps {
	courseId: string;
	onSuccess?: () => void;
}

type UploadStatus =
	| "idle"
	| "creating"
	| "uploading"
	| "processing"
	| "complete"
	| "error";

interface UploadState {
	status: UploadStatus;
	progress: number;
	error?: string;
	videoId?: string;
	bunnyVideoId?: string;
}

const ALLOWED_TYPES = [
	"video/mp4",
	"video/quicktime",
	"video/webm",
	"video/x-matroska",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; // 10GB

function VideoUploadComponent({ courseId, onSuccess }: VideoUploadProps) {
	const queryClient = useQueryClient();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const uploadRef = useRef<tus.Upload | null>(null);

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [uploadState, setUploadState] = useState<UploadState>({
		status: "idle",
		progress: 0,
	});

	// Create video mutation - gets upload URL from server
	const createVideoMutation = useMutation({
		mutationFn: async (data: {
			title: string;
			description?: string;
			courseId: string;
		}) => {
			return await client.v1.video.create({
				title: data.title,
				description: data.description,
				courseId: data.courseId,
				order: 0,
			});
		},
	});

	// Mark uploading mutation
	const markUploadingMutation = useMutation({
		mutationFn: async (id: string) => {
			return await client.v1.video.markUploading({ id });
		},
	});

	const handleFileSelect = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			if (!file) return;

			// Validate file type
			if (!ALLOWED_TYPES.includes(file.type)) {
				toast.error("Invalid file type. Please upload MP4, MOV, WebM, or MKV.");
				return;
			}

			// Validate file size
			if (file.size > MAX_FILE_SIZE) {
				toast.error("File too large. Maximum size is 10GB.");
				return;
			}

			setSelectedFile(file);

			// Auto-fill title if empty
			if (!title) {
				const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
				setTitle(fileName);
			}
		},
		[title],
	);

	const handleUpload = useCallback(async () => {
		if (!selectedFile || !title) {
			toast.error("Please enter a title and select a file");
			return;
		}

		try {
			// Step 1: Create video record and get upload URL
			setUploadState({ status: "creating", progress: 0 });

			const result = await createVideoMutation.mutateAsync({
				title,
				description: description || undefined,
				courseId,
			});

			const { video, uploadUrl } = result;
			setUploadState((prev) => ({
				...prev,
				videoId: video.id,
				bunnyVideoId: video.bunnyVideoId,
			}));

			// Step 2: Mark video as uploading
			await markUploadingMutation.mutateAsync(video.id);

			// Step 3: Start TUS upload
			setUploadState((prev) => ({ ...prev, status: "uploading" }));

			const upload = new tus.Upload(selectedFile, {
				endpoint: uploadUrl,
				retryDelays: [0, 3000, 5000, 10000, 20000],
				chunkSize: 10 * 1024 * 1024, // 10MB chunks
				metadata: {
					filename: selectedFile.name,
					filetype: selectedFile.type,
				},
				onError: (error) => {
					console.error("Upload error:", error);
					setUploadState((prev) => ({
						...prev,
						status: "error",
						error: error.message || "Upload failed",
					}));
					toast.error("Upload failed. Please try again.");
				},
				onProgress: (bytesUploaded, bytesTotal) => {
					const percentage = Math.round((bytesUploaded / bytesTotal) * 100);
					setUploadState((prev) => ({ ...prev, progress: percentage }));
				},
				onSuccess: () => {
					setUploadState((prev) => ({ ...prev, status: "processing" }));
					toast.success(
						"Upload complete! Video is now being processed. This may take a few minutes.",
					);

					// Reset form
					setTitle("");
					setDescription("");
					setSelectedFile(null);
					if (fileInputRef.current) {
						fileInputRef.current.value = "";
					}

					// Invalidate queries to refresh video list
					queryClient.invalidateQueries({
						queryKey: ["course-videos", courseId],
					});

					// Call success callback
					onSuccess?.();

					// After a delay, reset to idle
					setTimeout(() => {
						setUploadState({ status: "idle", progress: 0 });
					}, 3000);
				},
			});

			uploadRef.current = upload;

			// Check for previous uploads to resume
			upload.findPreviousUploads().then((previousUploads) => {
				if (previousUploads.length > 0) {
					upload.resumeFromPreviousUpload(previousUploads[0]);
				}
				upload.start();
			});
		} catch (error) {
			console.error("Upload error:", error);
			setUploadState({
				status: "error",
				progress: 0,
				error:
					error instanceof Error ? error.message : "Failed to create video",
			});
			toast.error("Failed to start upload");
		}
	}, [
		selectedFile,
		title,
		description,
		courseId,
		createVideoMutation,
		markUploadingMutation,
		queryClient,
		onSuccess,
	]);

	const handleCancel = useCallback(() => {
		if (uploadRef.current) {
			uploadRef.current.abort();
		}
		setUploadState({ status: "idle", progress: 0 });
		setSelectedFile(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	}, []);

	const handleDrop = useCallback(
		(event: React.DragEvent<HTMLDivElement>) => {
			event.preventDefault();
			event.stopPropagation();

			const file = event.dataTransfer.files?.[0];
			if (file) {
				// Simulate file input change
				const dataTransfer = new DataTransfer();
				dataTransfer.items.add(file);
				if (fileInputRef.current) {
					fileInputRef.current.files = dataTransfer.files;
					handleFileSelect({
						target: { files: dataTransfer.files },
					} as React.ChangeEvent<HTMLInputElement>);
				}
			}
		},
		[handleFileSelect],
	);

	const handleDragOver = useCallback(
		(event: React.DragEvent<HTMLDivElement>) => {
			event.preventDefault();
			event.stopPropagation();
		},
		[],
	);

	const isUploading =
		uploadState.status === "creating" || uploadState.status === "uploading";

	return (
		<Card>
			<CardHeader>
				<CardTitle>Upload Video</CardTitle>
				<CardDescription>
					Upload a video file to this course. Supported formats: MP4, MOV, WebM,
					MKV. Max size: 10GB.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Title & Description */}
				<div className="grid gap-4 md:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="video-title">Video Title *</Label>
						<Input
							id="video-title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Introduction to React"
							disabled={isUploading}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="video-description">Description</Label>
						<Input
							id="video-description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Optional description"
							disabled={isUploading}
						/>
					</div>
				</div>

				{/* File Drop Zone */}
				<div
					className={cn(
						"relative rounded-lg border-2 border-dashed p-8 text-center transition-colors",
						selectedFile
							? "border-primary bg-primary/5"
							: "border-muted-foreground/25 hover:border-muted-foreground/50",
						isUploading && "pointer-events-none opacity-50",
					)}
					onDrop={handleDrop}
					onDragOver={handleDragOver}
				>
					<input
						ref={fileInputRef}
						type="file"
						accept={ALLOWED_TYPES.join(",")}
						onChange={handleFileSelect}
						className="absolute inset-0 cursor-pointer opacity-0"
						disabled={isUploading}
					/>

					{selectedFile ? (
						<div className="flex items-center justify-center gap-3">
							<Film className="h-8 w-8 text-primary" />
							<div className="text-left">
								<p className="font-medium">{selectedFile.name}</p>
								<p className="text-muted-foreground text-sm">
									{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
								</p>
							</div>
							{!isUploading && (
								<Button
									variant="ghost"
									size="icon"
									onClick={(e) => {
										e.stopPropagation();
										setSelectedFile(null);
										if (fileInputRef.current) {
											fileInputRef.current.value = "";
										}
									}}
								>
									<X className="h-4 w-4" />
								</Button>
							)}
						</div>
					) : (
						<div className="space-y-2">
							<Upload className="mx-auto h-10 w-10 text-muted-foreground" />
							<p className="font-medium">
								Drag and drop a video file, or click to browse
							</p>
							<p className="text-muted-foreground text-sm">
								MP4, MOV, WebM, MKV up to 10GB
							</p>
						</div>
					)}
				</div>

				{/* Upload Progress */}
				{uploadState.status !== "idle" && (
					<div className="space-y-2">
						<div className="flex items-center justify-between text-sm">
							<span className="flex items-center gap-2">
								{uploadState.status === "creating" && (
									<>
										<Loader2 className="h-4 w-4 animate-spin" />
										Creating video...
									</>
								)}
								{uploadState.status === "uploading" && (
									<>
										<Loader2 className="h-4 w-4 animate-spin" />
										Uploading... {uploadState.progress}%
									</>
								)}
								{uploadState.status === "processing" && (
									<>
										<Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
										Processing video...
									</>
								)}
								{uploadState.status === "complete" && (
									<>
										<CheckCircle className="h-4 w-4 text-green-500" />
										Upload complete!
									</>
								)}
								{uploadState.status === "error" && (
									<>
										<AlertCircle className="h-4 w-4 text-destructive" />
										{uploadState.error || "Upload failed"}
									</>
								)}
							</span>
							{isUploading && (
								<Button variant="ghost" size="sm" onClick={handleCancel}>
									Cancel
								</Button>
							)}
						</div>
						{(uploadState.status === "uploading" ||
							uploadState.status === "creating") && (
							<Progress value={uploadState.progress} className="h-2" />
						)}
					</div>
				)}

				{/* Upload Button */}
				<div className="flex justify-end">
					<Button
						onClick={handleUpload}
						disabled={!selectedFile || !title || isUploading}
					>
						{isUploading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Uploading...
							</>
						) : (
							<>
								<Upload className="mr-2 h-4 w-4" />
								Upload Video
							</>
						)}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

export const VideoUpload = memo(VideoUploadComponent);
