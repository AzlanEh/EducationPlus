import { createContext } from "@eduPlus/api/context";
import { appRouter } from "@eduPlus/api/routers/index";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { Hono } from "hono";

export const apiHandler = new OpenAPIHandler(appRouter, {
	plugins: [
		new OpenAPIReferencePlugin({
			schemaConverters: [new ZodToJsonSchemaConverter()],
		}),
	],
	interceptors: [
		onError((error) => {
			console.error(error);
		}),
	],
});

export const rpcHandler = new RPCHandler(appRouter, {
	interceptors: [
		onError((error) => {
			console.error(error);
		}),
	],
});

export function setupApiRoutes(app: Hono) {
	app.use("/*", async (c, next) => {
		const context = await createContext({ context: c });

		const rpcResult = await rpcHandler.handle(c.req.raw, {
			prefix: "/rpc",
			context: context,
		});

		if (rpcResult.matched) {
			return c.newResponse(rpcResult.response.body, rpcResult.response);
		}

		const apiResult = await apiHandler.handle(c.req.raw, {
			prefix: "/api-reference",
			context: context,
		});

		if (apiResult.matched) {
			return c.newResponse(apiResult.response.body, apiResult.response);
		}

		await next();
	});

	return app;
}
