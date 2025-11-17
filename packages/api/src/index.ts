import { ORPCError, os } from "@orpc/server";
import type { Context, ExtendedUser } from "./context";

export const o = os.$context<Context>();

export const publicProcedure = o;

const requireAuth = o.middleware(async ({ context, next }) => {
	if (!context.session?.user) {
		throw new ORPCError("UNAUTHORIZED");
	}
	return next({
		context: {
			session: context.session,
		},
	});
});

export const protectedProcedure = publicProcedure.use(requireAuth);

// Role-based procedures
const requireAdmin = o.middleware(async ({ context, next }) => {
	if (!context.session?.user) {
		throw new ORPCError("UNAUTHORIZED");
	}
	const user = context.session.user as ExtendedUser;
	if (user.role !== "admin") {
		throw new ORPCError("FORBIDDEN", { message: "Admin access required" });
	}
	return next();
});

const requireStudent = o.middleware(async ({ context, next }) => {
	if (!context.session?.user) {
		throw new ORPCError("UNAUTHORIZED");
	}
	const user = context.session.user as ExtendedUser;
	if (user.role !== "student") {
		throw new ORPCError("FORBIDDEN", { message: "Student access required" });
	}
	return next();
});

export const adminProcedure = publicProcedure.use(requireAdmin);
export const studentProcedure = publicProcedure.use(requireStudent);
