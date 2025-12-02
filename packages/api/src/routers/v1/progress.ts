import { Course, User } from "@eduPlus/db";
import { adminProcedure } from "../../index";

export const progressRouter = {
	// Dashboard stats endpoints
	getDashboardStats: adminProcedure.handler(async () => {
		const totalCourses = await Course.countDocuments();
		const totalUsers = await User.countDocuments();
		const publishedCourses = await Course.countDocuments({ isPublished: true });
		const verifiedUsers = await User.countDocuments({ emailVerified: true });

		return {
			totalCourses,
			totalUsers,
			publishedCourses,
			verifiedUsers,
		};
	}),
};
