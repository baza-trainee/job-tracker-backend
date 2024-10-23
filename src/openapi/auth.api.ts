import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema } from "stoker/openapi/schemas";

import { insertUserSchema, registerResponseSchema, selectUsersSchema } from "@/db/schema";

const tags = ["Authorization"];

export const register = createRoute({
  path: "/register",
  method: "post",
  request: {
    body: jsonContentRequired(
      insertUserSchema,
      "Create user in DB",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      registerResponseSchema,
      "The created user",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertUserSchema),
      "The validation error(s)",
    ),
  },
});

export type RegisterRoute = typeof register;
