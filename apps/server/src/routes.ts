import { Course } from "@eduPlus/db";
import { swaggerUI } from "@hono/swagger-ui";
import { Hono } from "hono";
import { z } from "zod";
import { registry } from "./utils/prometheus";

const courseQuerySchema = z.object({
	subject: z.string().optional(),
	target: z.string().optional(),
	level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
	limit: z.coerce.number().min(1).max(100).default(50),
});

export function setupRoutes(app: Hono) {
	app.get("/", (c) => {
		return c.text("OK");
	});

	app.get("/health", (c) => {
		return c.json({
			status: "healthy",
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
		});
	});

	// Debug endpoint to test POST body handling
	app.post("/debug/echo-body", async (c) => {
		const startTime = Date.now();
		try {
			console.log("[Debug] Attempting to read body...");
			const body = await c.req.json();
			console.log("[Debug] Body read successfully:", body);
			return c.json({
				success: true,
				body,
				time: `${Date.now() - startTime}ms`,
			});
		} catch (error) {
			console.error("[Debug] Body read error:", error);
			return c.json(
				{
					success: false,
					error: error instanceof Error ? error.message : "Unknown error",
					time: `${Date.now() - startTime}ms`,
				},
				500,
			);
		}
	});

	// Debug endpoint to test MongoDB write operations
	app.get("/debug/db-write", async (c) => {
		const { client } = await import("@eduPlus/db");
		const testCollection = client.collection("_debug_test");

		const startTime = Date.now();
		try {
			// Test write
			const writeResult = await testCollection.insertOne({
				test: true,
				timestamp: new Date(),
			});
			const writeTime = Date.now() - startTime;

			// Test read
			const readStart = Date.now();
			await testCollection.findOne({ _id: writeResult.insertedId });
			const readTime = Date.now() - readStart;

			// Cleanup
			await testCollection.deleteOne({ _id: writeResult.insertedId });

			return c.json({
				success: true,
				writeTime: `${writeTime}ms`,
				readTime: `${readTime}ms`,
				totalTime: `${Date.now() - startTime}ms`,
			});
		} catch (error) {
			return c.json(
				{
					success: false,
					error: error instanceof Error ? error.message : "Unknown error",
					time: `${Date.now() - startTime}ms`,
				},
				500,
			);
		}
	});

	// Debug endpoint to test Better Auth's database adapter directly
	app.get("/debug/auth-db", async (c) => {
		const startTime = Date.now();

		try {
			// Import Better Auth's MongoDB client directly
			const { MongoClient } = await import("mongodb");
			const MONGODB_URI = process.env.DATABASE_URL;

			if (!MONGODB_URI) {
				return c.json({ success: false, error: "No DATABASE_URL" }, 500);
			}

			console.log("[Debug] Connecting to MongoDB via native client...");
			const client = new MongoClient(MONGODB_URI, {
				serverSelectionTimeoutMS: 5000,
				connectTimeoutMS: 5000,
			});

			await client.connect();
			const connectTime = Date.now() - startTime;
			console.log("[Debug] Native MongoDB connected in", connectTime, "ms");

			const db = client.db();

			// Test write
			const testCollection = db.collection("_native_debug_test");
			const writeStart = Date.now();
			const writeResult = await testCollection.insertOne({
				test: true,
				timestamp: new Date(),
			});
			const writeTime = Date.now() - writeStart;
			console.log("[Debug] Native MongoDB write completed in", writeTime, "ms");

			// Cleanup
			await testCollection.deleteOne({ _id: writeResult.insertedId });
			await client.close();

			return c.json({
				success: true,
				connectTime: `${connectTime}ms`,
				writeTime: `${writeTime}ms`,
				totalTime: `${Date.now() - startTime}ms`,
				dbName: db.databaseName,
			});
		} catch (error) {
			console.error("[Debug] Native MongoDB test error:", error);
			return c.json(
				{
					success: false,
					error: error instanceof Error ? error.message : "Unknown error",
					time: `${Date.now() - startTime}ms`,
				},
				500,
			);
		}
	});

	// Debug endpoint to test Better Auth social sign-in API directly
	app.get("/debug/auth-social", async (c) => {
		const { auth } = await import("@eduPlus/auth");
		const startTime = Date.now();

		try {
			console.log("[Debug] Starting auth.api.signInSocial...");

			// Use a timeout promise to detect hangs
			const timeoutPromise = new Promise((_, reject) => {
				setTimeout(
					() => reject(new Error("Auth API timed out after 8 seconds")),
					8000,
				);
			});

			const authPromise = auth.api.signInSocial({
				body: {
					provider: "google",
					callbackURL: "https://education-plus-web.vercel.app",
				},
			});

			const result = await Promise.race([authPromise, timeoutPromise]);

			console.log(
				"[Debug] auth.api.signInSocial completed in",
				Date.now() - startTime,
				"ms",
			);

			return c.json({
				success: true,
				time: `${Date.now() - startTime}ms`,
				hasUrl: !!(result as { url?: string })?.url,
			});
		} catch (error) {
			console.error("[Debug] auth.api.signInSocial error:", error);
			return c.json(
				{
					success: false,
					error: error instanceof Error ? error.message : "Unknown error",
					time: `${Date.now() - startTime}ms`,
				},
				500,
			);
		}
	});

	app.get("/metrics", async (c) => {
		c.header("Content-Type", registry.contentType);
		return c.text(await registry.metrics());
	});

	app.get("/docs", swaggerUI({ url: "/api-reference/openapi.json" }));

	app.get("/api/v1/courses", async (c) => {
		const parsed = courseQuerySchema.safeParse(
			Object.fromEntries(new URL(c.req.url).searchParams),
		);
		if (!parsed.success) return c.json({ message: "invalid_query" }, 400);
		const { subject, target, level, limit } = parsed.data;
		const filter: Record<string, unknown> = { isPublished: true };
		if (subject) filter.subject = subject;
		if (target) filter.target = target;
		if (level) filter.level = level;
		const items = await Course.find(filter).limit(limit).lean();
		return c.json({ items });
	});

	app.get("/api/v1/courses/:id", async (c) => {
		const id = c.req.param("id");
		const item = await Course.findById(id).lean();
		if (!item) return c.json({ message: "not_found" }, 404);
		return c.json({ item });
	});

	return app;
}
