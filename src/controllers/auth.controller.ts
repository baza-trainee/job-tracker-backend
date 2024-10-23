import cuid from "cuid";
import jwt from "jsonwebtoken";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";
import type { RegisterRoute } from "@/openapi/auth.api";

import { db } from "@/db";
import { users } from "@/db/schema";
import env from "@/env";
import { hashPassword } from "@/utils/hash-password";

// register user
export const registerUser: AppRouteHandler<RegisterRoute> = async (c) => {
  const { username, email, password } = c.req.valid("json");

  const user = await db.query.users.findFirst({
    where(fields, operators) {
      return operators.eq(fields.email, email);
    },
  });

  if (user) {
    return c.json({
      success: false,
      error: {
        name: "UserAlreadyExists",
        issues: [{
          code: "USER_EXISTS",
          path: ["email"],
          message: "User with this email already exists",
        }],
      },
    }, HttpStatusCodes.UNPROCESSABLE_ENTITY);
  }

  const hashedPassword = await hashPassword(password);

  const userToInsert = {
    id: cuid(),
    username,
    email,
    password: hashedPassword,
  };

  const [inserted] = await db
    .insert(users)
    .values([userToInsert])
    .returning();

  const token = jwt.sign(
    {
      id: inserted.id,
      username: inserted.username,
      email: inserted.email,
    },
    env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  return c.json({
    success: true,
    data: inserted,
    token,
  }, HttpStatusCodes.OK);
};
