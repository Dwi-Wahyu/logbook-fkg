"use client";

import { ShieldX, Lock, ArrowLeftCircle } from "lucide-react"; // Import more icons
import Link from "next/link"; // Import Link for navigation
import { Button } from "@/components/ui/button"; // Assuming you have Button component
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function UnauthorizedPage() {
  const router = useRouter();

  function handleLogout() {
    signOut({
      redirect: false,
    });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-center min-h-screen sm:p-6 lg:p-8">
      {/* Main Card Container */}
      <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 lg:p-12 text-center max-w-lg w-full transform transition-all duration-300 hover:scale-105">
        {/* Icon */}
        <div className="mb-6">
          <ShieldX className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 text-red-500 mx-auto drop-shadow-lg" />
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-red-700 mb-4 leading-tight">
          Akses Ditolak
        </h1>

        {/* Description */}
        <p className="text-base sm:text-lg text-gray-600 mb-6">
          Maaf, Anda tidak memiliki izin untuk mengakses halaman ini. Konten
          yang Anda coba kunjungi mungkin memerlukan hak akses khusus atau peran
          yang berbeda.
        </p>

        {/* Action Buttons (Optional: add a back button or link to dashboard) */}
        <div className="flex flex-col space-y-3">
          <Link href="/admin/dashboard" passHref>
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-lg text-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center">
              <ArrowLeftCircle className="w-5 h-5 mr-2" /> Kembali ke Dashboard
            </Button>
          </Link>
          <Button
            variant="outline"
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg text-lg transition-all duration-300"
            onClick={handleLogout}
          >
            <Lock className="w-5 h-5 mr-2" /> Login Ulang
          </Button>
        </div>
      </div>
    </div>
  );
}
