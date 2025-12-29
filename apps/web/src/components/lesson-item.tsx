import { CheckCircle, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Lesson } from "@/store";

interface LessonItemProps {
	lesson: Lesson;
	onToggleComplete?: (lessonId: string, completed: boolean) => void;
}

export function LessonItem({ lesson, onToggleComplete }: LessonItemProps) {
	return (
		<div className="flex items-center space-x-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50">
			<Button
				variant="ghost"
				size="sm"
				className="h-6 w-6 p-0"
				onClick={() => onToggleComplete?.(lesson.id, !lesson.completed)}
			>
				{lesson.completed ? (
					<CheckCircle className="h-5 w-5 text-green-600" />
				) : (
					<Circle className="h-5 w-5 text-muted-foreground" />
				)}
			</Button>
			<div className="flex-1">
				<h4
					className={`font-medium text-sm ${lesson.completed ? "text-muted-foreground line-through" : ""}`}
				>
					{lesson.title}
				</h4>
			</div>
		</div>
	);
}
