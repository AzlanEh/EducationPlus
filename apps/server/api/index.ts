import { handle } from "@hono/node-server/vercel";
console.log("Initializing Vercel API handler...");
import { app } from "../src/index";

export const config = {
  runtime: "nodejs",
};

export default handle(app);