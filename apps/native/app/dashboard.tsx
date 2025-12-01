import { Link } from "expo-router";
import { Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { CategoryChip } from "@/components/category-chip";
import { Container } from "@/components/container";
import { CourseCard } from "@/components/course-card";
import { courses } from "@/data/courses";
import { useProgress } from "@/hooks/useProgress";
import { useUser } from "@/hooks/useUser";

export default function Dashboard() {
	const { user } = useUser();
	const { getCourseProgress } = useProgress();

	return (
		<Container className="p-6">
			<Animated.View entering={FadeInDown}>
				<View className="mb-6">
					<Text className="font-bold text-3xl text-foreground">
						Welcome, {user.name}
					</Text>
					<Text className="text-muted text-xs">
						Continue your learning journey
					</Text>
				</View>
				<View className="mb-4 flex-row">
					<CategoryChip label="All" selected />
					<CategoryChip label="Frontend" />
					<CategoryChip label="Mobile" />
					<CategoryChip label="Backend" />
				</View>
				<View className="mb-4 flex-row justify-between">
					<Link href="/courses">
						<Text className="text-primary">Browse Courses</Text>
					</Link>
					<Link href="/profile">
						<Text className="text-primary">Profile</Text>
					</Link>
				</View>
				<View className="mb-3">
					<Text className="font-semibold text-foreground text-lg">
						Your Courses
					</Text>
				</View>
				{courses.map((c) => (
					<CourseCard
						key={c.id}
						course={c}
						progress={getCourseProgress(c.lessons.map((l) => l.id))}
					/>
				))}
			</Animated.View>
		</Container>
	);
}
