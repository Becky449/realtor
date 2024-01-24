import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { users } from "~/server/db/schema";

export const userRouter = createTRPCRouter({
  getByEmailAndPassword: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.users.findFirst({
        where(fields, operators) {
          return operators.and(
            operators.eq(fields.email, input.email),
            operators.eq(fields.passwordHash, input.password),
          );
        },
      });
    }),
});
