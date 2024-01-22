import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const user_type = pgEnum("user_type", ["client", "member", "both"]);
export const user_status = pgEnum("user_status", ["active", "deleted"]);
export const login_method = pgEnum("login_method", ["email", "phone", "oauth"]);

export const users = pgTable("users", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  mobile: text("mobile"),
  user_type: user_type("user_type").notNull(),
  status: user_status("status").notNull(),
  verified: boolean("verified").notNull(),
  login_method: login_method("login_method").notNull(),
  password_hash: text("password_hash"),
  created_at: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
  updated_at: timestamp("updated_at", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
});
