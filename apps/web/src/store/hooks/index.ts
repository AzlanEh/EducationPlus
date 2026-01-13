import { useEffect, useRef } from "react";
import coursesData from "@/data/courses.json";
import { useCoursesStore } from "../courses";

export const useInitializeStores = () => {
	const { setCourses } = useCoursesStore();
	const initializedRef = useRef(false);

	useEffect(() => {
		// Only initialize once
		if (initializedRef.current) return;
		initializedRef.current = true;

		// Initialize courses data (auth is handled by Better-Auth)
		const initializeData = async () => {
			try {
				// Initialize courses data
				setCourses(coursesData);
			} catch (error) {
				console.error("Failed to initialize stores:", error);
			}
		};

		initializeData();
	}, [setCourses]);
};
