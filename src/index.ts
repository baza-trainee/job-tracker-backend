/* eslint-disable no-console */
import { serve } from "@hono/node-server";

import env from "@/env";

import app from "./app";

const port = Number(env.PORT) || 4000;

console.log(`Server is running on port http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
