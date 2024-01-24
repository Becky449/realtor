"use client";

import { InferInsertModel } from "drizzle-orm";
import { signIn } from "next-auth/react";
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
import { registerAction } from "./action";

export default function SignUpForm() {
  const form = useForm<InferInsertModel<typeof users> & { confirm: string }>({
    defaultValues: {
      passwordHash: "",
      name: "",
      email: "",
      confirm: "",
    },
  });
  const router = useRouter();

  const onSubmit = async (
    data: InferInsertModel<typeof users> & { confirm: string },
  ) => {
    if (!data.passwordHash) {
      form.setError("passwordHash", {
        type: "manual",
        message: "Password is required",
      });
      return;
    }

    const { error, success } = await registerAction({
      name: data.name,
      email: data.email,
      password: data.passwordHash,
      confirm: data.confirm,
    });

    if (error) {
      form.setError("email", {
        type: "manual",
        message: error,
      });
    }

    success && (await signIn("credentials", { redirect: false }));
  };

  return (
    <Form {...form}>
      <form
        className="w-full max-w-sm space-y-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <h1 className="text-2xl font-medium">Register</h1>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Your name"
                  type="text"
                  autoComplete="name"
                  value={field.value as string}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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

        <FormField
          control={form.control}
          name="confirm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
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
          <Button className="w-full">Register</Button>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link className="text-primary" href={"/auth/signin"}>
              signin here
            </Link>
          </p>
        </div>
      </form>
    </Form>
  );
}
