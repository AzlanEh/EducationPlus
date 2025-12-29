import { Course, User } from "@eduPlus/db";
import { z } from "zod";
import { adminProcedure } from "../../index";

export const adminRouter = {
	// Dashboard stats endpoints
	getDashboardStats: adminProcedure
		.input(z.object({}))
		.handler(async ({ input: _ }) => {
			const [totalCourses, totalUsers, publishedCourses, verifiedUsers] =
				await Promise.all([
					Course.countDocuments(),
					User.countDocuments(),
					Course.countDocuments({ isPublished: true }),
					User.countDocuments({ emailVerified: true }),
				]);
			return {
				totalCourses,
				totalUsers,
				publishedCourses,
				verifiedUsers,
			};
		}),
};
