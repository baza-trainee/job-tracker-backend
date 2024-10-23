/* eslint-disable ts/ban-ts-comment */
import { handle } from "@hono/node-server/vercel";

/* eslint-disable antfu/no-import-dist */
// @ts-expect-error
import app from "../dist/src/app.js";

export default handle(app);
