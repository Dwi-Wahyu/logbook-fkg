import { auth } from "@/config/auth";
import { redirect } from "next/navigation";
import ClientAdminLayout from "../_components/AdminLayout";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return <ClientAdminLayout>{children}</ClientAdminLayout>;
}
