import { relations } from "drizzle-orm";
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
  userType: user_type("user_type").notNull(),
  status: user_status("status").notNull(),
  verified: boolean("verified").notNull(),
  loginMethod: login_method("login_method").notNull(),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
});

export const userRelations = relations(users, (helpers) => ({
  passwordHistory: helpers.many(userPasswordHistory),
  credentialReset: helpers.many(userCredentialReset),
}));

export const userPasswordHistory = pgTable("user_password_history", {
  userId: integer("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  passwordHash: text("password_hash").notNull(),
  deletedAt: timestamp("deleted_at", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
});

export const userPasswordHistoryRelations = relations(
  userPasswordHistory,
  (helpers) => ({
    users: helpers.one(users, {
      fields: [userPasswordHistory.userId],
      references: [users.id],
    }),
  }),
);

export const userCredentialReset = pgTable("user_credential_reset", {
  userId: integer("userId")
    .references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  token: text("token").notNull(),
  sentAt: timestamp("sent_at", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
  expireAt: timestamp("expire_at", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
  usedAt: timestamp("used_at", {
    mode: "date",
    withTimezone: true,
  }),
});

export const userCredentialResetRelations = relations(
  userCredentialReset,
  (helpers) => ({
    users: helpers.one(users, {
      fields: [userCredentialReset.userId],
      references: [users.id],
    }),
  }),
);
