import { Text, View } from "react-native";
import { Container } from "@/components/container";
import { CourseCard } from "@/components/course-card";
import { courses } from "@/data/courses";
import { useProgress } from "@/hooks/useProgress";

export default function Courses() {
	const { getCourseProgress } = useProgress();
	return (
		<Container className="p-6">
			<View className="mb-4">
				<Text className="font-semibold text-foreground text-xl">Courses</Text>
			</View>
			{courses.map((c) => (
				<CourseCard
					key={c.id}
					course={c}
					progress={getCourseProgress(c.lessons.map((l) => l.id))}
				/>
			))}
		</Container>
	);
}
