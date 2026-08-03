import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Home, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen min-h-[100svh] flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-900/90 rounded-2xl shadow-xl border border-gray-200/80 dark:border-gray-800 backdrop-blur-sm text-center relative z-10 space-y-6 transition-all duration-300">
        {/* 404 Visual Icon Badge */}
        <div className="relative inline-flex items-center justify-center my-2">
          <div className="w-24 h-24 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center animate-pulse">
            <SearchX className="w-12 h-12 text-primary" />
          </div>
        </div>

        {/* Title and Description */}
        <div className="space-y-2 mt-4">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-3xl">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Maaf, halaman yang Anda cari tidak tersedia, telah dipindahkan, atau
            alamat URL yang dimasukkan kurang tepat.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/admin/dashboard" className="w-full sm:w-auto">
            <Button className="w-full gap-2 shadow-md hover:shadow-lg transition-all">
              <Home className="w-4 h-4" />
              Kembali ke Dashboard
            </Button>
          </Link>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">
          © {new Date().getFullYear()} Logbook FKG Universitas Hasanuddin
        </div>
      </div>
    </div>
  );
}
