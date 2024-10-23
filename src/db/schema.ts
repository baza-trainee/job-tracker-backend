import { pgTable, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id", { length: 25 }).primaryKey(),
  username: varchar("username").notNull(),
  email: varchar("email").notNull(),
  password: varchar("password").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    emailIdx: uniqueIndex("email_idx").on(table.email),
  };
});

export const selectUsersSchema = createSelectSchema(users).partial();
export const selectOneUserSchema = selectUsersSchema.partial();

// users schema
export const insertUserSchema = createInsertSchema(
  users,
  {
    username: schema => schema.username.min(1).max(500),
    email: schema => schema.email.min(1).max(500),
    password: schema => schema.password.min(1).max(500),
  },
).required({
  username: true,
  email: true,
  password: true,
}).omit({
  id: true,
  created_at: true,
});

export const patchUserSchema = insertUserSchema.partial();

export const registerResponseSchema = z.object({
  success: z.boolean(),
  data: selectUsersSchema, // This includes user information based on the existing selectUsersSchema
  token: z.string(), // Define the token as a string
});
