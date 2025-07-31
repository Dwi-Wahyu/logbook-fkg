import { auth } from "@/config/auth";
import { redirect } from "next/navigation";
import LoginForm from "./_components/LoginForm";

export default async function Masuk() {
  const session = await auth();

  if (session) {
    const now = new Date();
    const expires = new Date(session.expires);

    if (now < expires) {
      redirect("/admin/dashboard");
    }
  }

  return (
    <div className="flex flex-col justify-center md:flex-row w-full min-h-screen">
      <div className="md:w-[29.5rem]">
        <LoginForm />
      </div>
      <div className="grow hidden md:block relative bg-[url('/bg-login.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/20  dark:bg-black/10"></div>
        <div className="relative z-10 flex p-5 h-full"></div>
      </div>
    </div>
  );
}
