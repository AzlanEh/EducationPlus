import type {
	adminRouter,
	authRouter,
	courseRouter,
	progressRouter,
	studentRouter,
	userRouter,
} from "@eduPlus/api/routers/v1";
import type { RouterClient } from "@orpc/server";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
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

export const link = new RPCLink({
	url: `${import.meta.env.VITE_SERVER_URL}/rpc`,
	fetch(url, options) {
		return fetch(url, {
			...options,
			credentials: "include",
		});
	},
});

export const client: RouterClient<AppRouterType> = createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);
