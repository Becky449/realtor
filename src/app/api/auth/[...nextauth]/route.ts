import NextAuth, { NextAuthOptions } from "next-auth";
import { decode, encode } from "next-auth/jwt";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { authOptions } from "~/server/auth";

const handler = NextAuth(authOptions);
export { handler as GET };

// handle special email-password callback route
export async function POST(
  req: NextRequest,
  handlerContext: { params: { nextauth: string[] } },
) {
  const path = req.nextUrl.pathname;
  const isEmailPasswordCallback =
    path.includes("callback") && path.includes("email-password");

  // update auth options to use next-auth.session-token cookie for email-password
  const newAuthOptions: NextAuthOptions = {
    ...authOptions,
    jwt: {
      encode: async ({ secret, token, maxAge }) => {
        if (isEmailPasswordCallback) {
          const nextCookie = cookies().get("next-auth.session-token");

          if (nextCookie) {
            return nextCookie.value;
          } else {
            return "";
          }
        }
        return encode({ secret, token, maxAge });
      },
      decode: async ({ token, secret }) => {
        if (isEmailPasswordCallback) {
          return null;
        }
        return decode({ secret, token });
      },
    },
    callbacks: {
      ...authOptions.callbacks,
      async signIn({ user }) {
        if (isEmailPasswordCallback) {
          if (user) {
            const sessionToken = crypto.randomUUID();
            const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

            await authOptions.adapter?.createSession!({
              sessionToken,
              userId: user.id,
              expires,
            });

            cookies().set("next-auth.session-token", sessionToken, {
              expires,
            });
          }
        }

        return true;
      },
    },
  };

  return await NextAuth(req, handlerContext, newAuthOptions);
}
