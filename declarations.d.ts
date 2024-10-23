import type { z } from "@hono/zod-openapi";

declare const IdParamsSchema: z.ZodObject<{
  id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: string;
  }, {
    id: string;
  }>;
export default IdParamsSchema;
