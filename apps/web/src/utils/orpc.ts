import type {
	adminRouter,
	authRouter,
	courseRouter,
	liveRouter,
	progressRouter,
	studentRouter,
	userRouter,
	videoRouter,
} from "@eduPlus/api/routers/v1";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Build router interface from individual router types
// This approach is recommended by oRPC to avoid type inference issues
// See: https://orpc.unnoq.com/docs/advanced/exceeds-the-maximum-length-problem
type V1RouterType = {
	auth: typeof authRouter;
	course: typeof courseRouter;
	user: typeof userRouter;
	progress: typeof progressRouter;
	admin: typeof adminRouter;
	student: typeof studentRouter;
	video: typeof videoRouter;
	live: typeof liveRouter;
};

type AppRouterType = {
	v1: V1RouterType;
};

export const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: (error) => {
			toast.error(`Error: ${error.message}`, {
				action: {
					label: "retry",
					onClick: () => {
						queryClient.invalidateQueries();
					},
				},
			});
		},
	}),
});

// In development with proxy, use full origin URL (same origin)
// In production, use the full server URL
const isDev = import.meta.env.DEV;
const rpcUrl = isDev
	? `${window.location.origin}/rpc`
	: `${import.meta.env.VITE_SERVER_URL}/rpc`;

export const link = new RPCLink({
	url: rpcUrl,
	fetch(url, options) {
		return fetch(url, {
			...options,
			credentials: "include",
		});
	},
});

export const client: RouterClient<AppRouterType> = createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);
