/* eslint-disable ts/ban-ts-comment */
import { handle } from "hono/vercel";

/* eslint-disable antfu/no-import-dist */
// @ts-expect-error
import app from "../dist/src/app.js";

export const runtime = "edge";

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);
export const HEAD = handle(app);
