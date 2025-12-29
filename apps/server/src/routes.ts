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
