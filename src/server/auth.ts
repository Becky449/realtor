import { DrizzleAdapter } from "@auth/drizzle-adapter";
import bcrypt from "bcrypt";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import Credentials from "next-auth/providers/credentials";
import { db } from "~/server/db";
import { createTable } from "~/server/db/schema";
import { api } from "~/trpc/server";

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

const adapter = DrizzleAdapter(db, createTable) as Adapter;

export const authOptions: NextAuthOptions = {
  adapter,
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  providers: [
    Credentials({
      id: "email-password",
      name: "Email and Password",
      type: "credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "your@email.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials || !credentials.email || !credentials.password) {
          return null;
        }

        const user = await api.user.getByEmailAndPassword.query({
          email: credentials.email,
        });

        if (!user || !user.passwordHash) return null;

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.passwordHash,
        );

        if (passwordMatch) return user;

        return null;
      },
    }),
  ],
};

export const getServerAuthSession = () => getServerSession(authOptions);
