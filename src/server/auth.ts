import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { pgTable } from "drizzle-orm/pg-core";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

import { env } from "~/env";
import { db } from "~/server/db";
import { users } from "./db/schema";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  adapter: DrizzleAdapter(db) as Adapter,
  providers: [
    Credentials({
      id: "sign-in",
      name: "Sign in",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "your@email.com",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials, req) {
        // if credentials have been passed
        if (credentials?.email) {
          // look up the user in the database
          try {
            const user = await db.query.users.findFirst({
              where: (users, filters) =>
                filters.eq(users.email, credentials?.email),
            });

            // if a user was found, return the user object
            if (user) return user;
          } catch (error) {
            console.error("error", error);
          }
        }

        return null;
      },
    }),
    Credentials({
      id: "sign-up",
      name: "Sign up with email and password",
      credentials: {
        name: {
          label: "Name",
          type: "text",
          placeholder: "Full Name",
        },
        email: {
          label: "Email",
          type: "email",
          placeholder: "your@email.com",
        },
        mobile: {
          label: "Mobile",
          type: "text",
          placeholder: "Mobile Number",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials, req) {
        console.log("new credentials", credentials);
        // if credentials have been passed
        if (credentials?.email) {
          // look up the user in the database
          const user = await db.query.users.findFirst({
            where: (users, filters) =>
              filters.eq(users.email, credentials?.email),
          });

          console.log("new user search", user);

          // if a user was found, return error saying user already exists
          if (user) {
            console.log("found user");
            return null;
          }

          console.log("no user found");

          // if no user was found, create a new user
          try {
            const newUser = await db
              .insert(users)
              .values({
                id: crypto.randomUUID(),
                name: credentials.name,
                email: credentials.email,
                emailVerified: new Date(),
                image: null,
                passwordHash: bcrypt.hashSync(credentials.password, 10),
              })
              .returning();

            console.log("newUser", newUser);

            if (newUser[0]) {
              return newUser[0];
            }
          } catch (error) {
            console.error(error);
          }
        }

        return null;
      },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
