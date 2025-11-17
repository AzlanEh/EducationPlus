import type { Context as HonoContext } from "hono";
import { auth } from "@eduPlus/auth";

export type CreateContextOptions = {
	context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions) {
	let session = null;
	try {
		session = await auth.api.getSession({
			headers: context.req.raw.headers,
		});
	} catch (error) {
		console.error("Failed to get session:", error);
	}
	return {
		session,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;

// Extended user type with additional fields
export type ExtendedUser = {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	email: string;
	emailVerified: boolean;
	name: string;
	image?: string | null;
	role: "student" | "admin";
	target?: string;
	gender?: "male" | "female" | "other";
	phoneNo?: string;
	signupSource: "native" | "web";
};
