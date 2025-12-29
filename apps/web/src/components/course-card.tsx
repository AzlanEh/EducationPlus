import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Course } from "@/store";

interface CourseCardProps {
	course: Course;
	onSelect?: (course: Course) => void;
}

export function CourseCard({ course, onSelect }: CourseCardProps) {
	return (
		<Card
			className="cursor-pointer transition-all hover:shadow-md"
			onClick={() => onSelect?.(course)}
		>
			<CardHeader className="space-y-2">
				<div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
					<img
						src={course.imageUrl}
						alt={course.title}
						className="h-full w-full object-cover"
					/>
				</div>
				<div className="space-y-1">
					<CardTitle className="text-lg">{course.title}</CardTitle>
					<CardDescription className="text-muted-foreground text-sm">
						{course.description}
					</CardDescription>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center justify-between">
					<Badge variant="secondary">{course.duration}</Badge>
					<span className="text-muted-foreground text-sm">
						{Math.round(course.progress)}% complete
					</span>
				</div>
				<Progress value={course.progress} className="w-full" />
			</CardContent>
		</Card>
	);
}
