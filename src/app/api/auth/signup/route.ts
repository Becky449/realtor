import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { accounts, users } from "~/server/db/schema";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  const { name, email, password, confirm, csrfToken } = await request.json();

  if (!(name && email && password && confirm && password.length >= 1)) {
    return NextResponse.json(
      { statusText: "invalid user parameters" },
      { status: 400 },
    );
  }

  if (password != confirm) {
    return NextResponse.json(
      { statusText: "password missmatch" },
      { status: 400 },
    );
  }

  const user = await db.query.users.findFirst({
    where(fields, operators) {
      return operators.eq(fields.email, email);
    },
  });

  if (user) {
    return NextResponse.json(
      { statusText: "user already exists" },
      { status: 400 },
    );
  }

  const newUser = await db
    .insert(users)
    .values({
      name,
      email,
      passwordHash: bcrypt.hashSync(password, 10),
    })
    .returning();

  if (!newUser[0]) {
    return NextResponse.json(
      { statusText: "unable to create user" },
      { status: 500 },
    );
  }

  // @ts-ignore
  const userAccount = await db
    .insert(accounts)
    .values({
      userId: newUser[0].id,
      type: "credentials",
      provider: "credentials",
      providerAccountId: newUser[0].id,
    })
    .returning();

  if (newUser[0] && userAccount[0]) {
    return NextResponse.json({
      id: newUser[0].id,
      name: newUser[0].name,
      email: newUser[0].email,
    });
  }

  return NextResponse.json(
    {
      statusText: "unable to link account to created user",
    },
    { status: 500 },
  );
}
