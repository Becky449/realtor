import { DrizzleAdapter } from "@auth/drizzle-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import Credentials from "next-auth/providers/credentials";

import { env } from "~/env";
import { db } from "~/server/db";
import { createTable } from "~/server/db/schema";
import { api } from "~/trpc/server";
import bcrypt from "bcrypt";
import { decode, encode } from "next-auth/jwt";

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

const adapter = DrizzleAdapter(db, createTable);

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  jwt: {
    encode: async ({ secret, token, maxAge }) => {
      return encode({ secret, token, maxAge });
    },
    decode: async ({ token, secret }) => {
      return decode({ secret, token });
    },
  },
  callbacks: {
    signIn: async ({ user, account, profile, email, credentials }) => {
      adapter.createSession!({
        sessionToken: crypto.randomUUID(),
        userId: user.id,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      });
      return true;
    },
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  adapter: adapter as Adapter,
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    Credentials({
      id: "email-password",
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "your@email.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // if no credentials have been supplied, return null to indicate no user
        if (!credentials || !credentials.email || !credentials.password) {
          return null;
        }

        // lookup user in database
        const user = await api.user.getByEmailAndPassword.query({
          email: credentials.email,
          password: bcrypt.hashSync(credentials.password, 10),
        });

        if (user) return user;

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
export const getServerAuthSession = () => getServerSession(authOptions);
