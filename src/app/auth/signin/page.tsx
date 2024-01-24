import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";
import SignInForm from "./form";

export default async function SignInPage() {
  const session = await getServerAuthSession();

  if (session) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center">
      <SignInForm />
    </div>
  );
}
