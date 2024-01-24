"use server";

import { db } from "~/server/db";
import { accounts, users } from "~/server/db/schema";
import bcrypt from "bcrypt";

export const registerAction = async ({
  name,
  email,
  password,
  confirm,
}: {
  name: string | null | undefined;
  email: string;
  password: string;
  confirm: string;
}) => {
  if (!(name && email && password && confirm && password.length >= 1)) {
    return {
      error: "invalid user parameters",
    };
  }

  if (password != confirm) {
    return {
      error: "password missmatch",
    };
  }

  const userExists = await db.query.users.findFirst({
    where(fields, operators) {
      return operators.eq(fields.email, email);
    },
  });

  if (userExists) {
    return {
      error: "user already exists",
    };
  }

  const createUser = await db
    .insert(users)
    .values({
      name,
      email,
      passwordHash: bcrypt.hashSync(password, 10),
    })
    .returning();

  if (!createUser || !createUser.length || !createUser[0]) {
    return {
      error: "unable to create user",
    };
  }

  const user = createUser[0];

  // @ts-ignore
  const userAccount = await db
    .insert(accounts)
    .values({
      userId: user.id,
      type: "credentials",
      provider: "credentials",
      providerAccountId: user.id,
    })
    .returning();

  if (user && userAccount[0]) {
    return {
      success: true,
    };
  }

  return {
    error: "unable to create user and link account",
  };
};
