import { handle } from "@hono/node-server/vercel";
import { app } from "../src/index";

export const config = {
  runtime: "nodejs",
};

export default handle(app);