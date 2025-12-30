import { handle } from "@hono/node-server/vercel";
console.log("Initializing Vercel API handler...");
// @ts-ignore - Importing from build artifact
import { app } from "../dist/index.js";

export const config = {
  runtime: "nodejs",
};

export default handle(app);