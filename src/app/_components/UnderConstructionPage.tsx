// src/app/under-construction/page.tsx
import Link from "next/link";
import { Wrench, Home, Construction, CircleDotDashed } from "lucide-react"; // Import some relevant icons
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function UnderConstructionPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br p-4 sm:p-6">
      {/* Main Card Container */}
      <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 lg:p-12 text-center max-w-md w-full transform transition-all duration-300 hover:scale-105">
        {/* Icon */}
        <div className="mb-6">
          <Construction className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 text-blue-500 mx-auto drop-shadow-lg animate-bounce-slow" />
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-700 mb-4 leading-tight">
          Halaman Sedang Dalam Pengerjaan
        </h1>

        {/* Description */}
        <p className="text-base text-gray-600 mb-6">
          Kami sedang bekerja keras untuk menghadirkan fitur ini. Mohon
          bersabar, halaman ini akan segera tersedia!
        </p>

        {/* Progress / Status (Optional) */}
        <div className="flex items-center justify-center text-blue-600 mb-8">
          <CircleDotDashed className="h-5 w-5 mr-2 animate-spin" />
          <span className="font-semibold text-lg">
            Pembaruan sedang berlangsung...
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3">
          <Link href="/admin/dashboard" passHref>
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-lg text-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center">
              <Home className="w-5 h-5 mr-2" /> Kembali ke Dashboard
            </Button>
          </Link>
          {/* Anda bisa menambahkan tombol lain, misalnya untuk menghubungi dukungan */}
          {/* <Link href="/contact" passHref>
            <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg text-lg transition-all duration-300">
              <Phone className="w-5 h-5 mr-2" /> Hubungi Dukungan
            </Button>
          </Link> */}
        </div>
      </div>
    </div>
  );
}
