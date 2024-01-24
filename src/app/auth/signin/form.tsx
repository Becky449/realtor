"use client";

import { signIn } from "next-auth/react";
import { InferInsertModel } from "drizzle-orm";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { users } from "~/server/db/schema";

export default function SignInForm() {
  const form = useForm<InferInsertModel<typeof users>>();
  const router = useRouter();

  const onSubmit = async (data: InferInsertModel<typeof users>) => {
    if (!data.passwordHash) {
      form.setError("passwordHash", {
        type: "manual",
        message: "Password is required",
      });
      return;
    }

    const response = await fetch(
      "http://localhost:3000/api/auth/callback/email-password",
      {
        method: "POST",
        body: JSON.stringify({
          email: data.email,
          password: data.passwordHash,
        }),
      },
    );
  };

  return (
    <Form {...form}>
      <form
        className="w-full max-w-sm space-y-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <h1 className="text-2xl font-medium">Sign in</h1>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="your@email.com"
                  type="email"
                  autoComplete="email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="passwordHash"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  autoComplete="password"
                  value={field.value as string}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-2 pt-4">
          <Button className="w-full">Sign in</Button>
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link className="text-primary" href={"/auth/register"}>
              register here
            </Link>
          </p>
        </div>
      </form>
    </Form>
  );
}
