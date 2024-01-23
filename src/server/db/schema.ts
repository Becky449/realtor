import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { AdapterAccount } from "next-auth/adapters";

export const userType = pgEnum("user_type", ["client", "member", "both"]);
export const userStatus = pgEnum("user_status", ["active", "deleted"]);
export const loginMethod = pgEnum("login_method", ["email", "phone", "oauth"]);

export const users = pgTable("users", {
  /** minimum requirements for nextauth **/
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  /** end of minimum requirements for nextauth **/
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});

const userRelations = relations(users, (helpers) => ({
  sessions: helpers.many(sessions),
}));

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const sessions = pgTable("sessions", {
  /* minimum requirements for nextauth */
  sessionToken: text("sessoinToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
  /* end of minimum requirements for nextauth */
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifer: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifer, vt.token] }),
  }),
);
