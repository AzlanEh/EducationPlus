import { useEffect } from "react";
import coursesData from "@/data/courses.json";
import profileData from "@/data/profile.json";
import { useAuthStore } from "../auth";
import { useCoursesStore } from "../courses";

export const useInitializeStores = () => {
	const { setUser, setLoading } = useAuthStore();
	const { setCourses } = useCoursesStore();

	useEffect(() => {
		// Initialize with static data (in a real app, this would be API calls)
		const initializeData = async () => {
			try {
				setLoading(true);

				// Simulate API call delay
				await new Promise((resolve) => setTimeout(resolve, 500));

				// Initialize user data
				setUser({
					id: "user-1",
					name: profileData.name,
					email: profileData.email,
					bio: profileData.bio,
					avatarUrl: profileData.avatarUrl,
				});

				// Initialize courses data
				setCourses(coursesData);
			} catch (error) {
				console.error("Failed to initialize stores:", error);
			} finally {
				setLoading(false);
			}
		};

		initializeData();
	}, [setUser, setLoading, setCourses]);
};
