import cuid from "cuid";
import { eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";
import type { GetOneRoute, ListRoute, RemoveRoute, UpdateRoute } from "@/openapi/users.api";

import { db } from "@/db";
import { users } from "@/db/schema";
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/lib/constants";
import { hashPassword } from "@/utils/hash-password";

// get all users
export const getAll: AppRouteHandler<ListRoute> = async (c) => {
  const allUsers = await db.select({
    id: users.id,
    username: users.username,
    email: users.email,
    created_at: users.created_at,
  })
    .from(users);

  return c.json(allUsers, HttpStatusCodes.OK);
};

// get one user
export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const id = c.req.param("id");
  const user = await db.select({
    id: users.id,
    username: users.username,
    email: users.email,
    created_at: users.created_at,
  })
    .from(users)
    .where(eq(users.id, id))
    .limit(1)
    .then(res => res[0]);

  if (!user) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(user, HttpStatusCodes.OK);
};

// update user
export const updateUser: AppRouteHandler<UpdateRoute> = async (c) => {
  const id = c.req.param("id");
  const updates = c.req.valid("json");

  if (Object.keys(updates).length === 0) {
    return c.json(
      {
        success: false,
        error: {
          issues: [
            {
              code: ZOD_ERROR_CODES.INVALID_UPDATES,
              path: [],
              message: ZOD_ERROR_MESSAGES.NO_UPDATES,
            },
          ],
          name: "ZodError",
        },
      },
      HttpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }

  const [updatedUser] = await db.update(users)
    .set(updates)
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      username: users.username,
      email: users.email,
      created_at: users.created_at,
      // Note: password is intentionally omitted from the return
    });

  if (!updatedUser) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(updatedUser, HttpStatusCodes.OK);
};

// remove user
export const removeUser: AppRouteHandler<RemoveRoute> = async (c) => {
  const id = c.req.param("id");
  const result = await db.delete(users)
    .where(eq(users.id, id))
    .returning({ deletedId: users.id });

  if (result.length === 0) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json({ message: "User successfully deleted" }, HttpStatusCodes.OK);
};
