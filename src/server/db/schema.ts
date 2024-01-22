import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const userType = pgEnum("user_type", ["client", "member", "both"]);
export const userStatus = pgEnum("user_status", ["active", "deleted"]);
export const loginMethod = pgEnum("login_method", ["email", "phone", "oauth"]);

export const users = pgTable("users", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  mobile: text("mobile"),
  userType: userType("user_type").notNull(),
  status: userStatus("status").notNull(),
  verified: boolean("verified").notNull(),
  loginMethod: loginMethod("login_method").notNull(),
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
  sessions: helpers.many(userSessions),
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

export const userSessionStatus = pgEnum("user_session_status", [
  "active",
  "inactive",
  "expired",
]);

export const userSessions = pgTable("user_sessions", {
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  accessToken: text("access_token").notNull(),
  profileId: text("profile_id").notNull(),
  deviceIdentifier: text("device_identifier").notNull(),
  deviceName: text("device_name").notNull(),
  lastActivityTime: timestamp("last_activity_time", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
  status: userSessionStatus("status").notNull(),
  loginTime: timestamp("login_time", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
  ipAddress: text("ip_address").notNull(),
  location: text("location").notNull(),
  logoutTime: timestamp("logout_time", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
});

export const userSessionsRelations = relations(userSessions, (helpers) => ({
  users: helpers.one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));
