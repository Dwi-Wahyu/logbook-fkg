"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/config/auth";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      await signOut({
        redirect: false,
        redirectTo: "/",
      });
      router.push("/");
    };

    handleLogout();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Signing out...</h1>
        <p>Please wait while we securely log you out.</p>
      </div>
    </div>
  );
}
