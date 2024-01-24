import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { users } from "~/server/db/schema";

export const userRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db
        .insert(users)
        .values({
          name: input.name,
          email: input.email,
          passwordHash: input.password,
        })
        .returning();
    }),
  getByEmailAndPassword: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.users.findFirst({
        where(fields, operators) {
          return operators.eq(fields.email, input.email);
        },
      });
    }),
});
