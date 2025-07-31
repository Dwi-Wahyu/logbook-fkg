// src/app/admin/pengaturan/program-studi/[id]/page.tsx
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/config/auth"; // Import auth for session handling
import { SearchParams } from "nuqs/server"; // Import SearchParams type from nuqs/server

import { getPenggunaByProgramStudi } from "@/app/_lib/queries/penggunaQueries"; // Server-side data fetching
import { getProgramStudiById } from "@/app/_lib/queries/programStudiQueries"; // Server-side data fetching
import { penggunaSearchParams } from "@/app/_lib/validations/penggunaSearchParams"; // nuqs search params schema

// Import Client Components and UI elements
import { DatatableSkeleton } from "@/components/datatable/datatable-skeleton";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Users, BookOpen, UserPlus } from "lucide-react"; // Icons
import Link from "next/link"; // For the "Tambah Pengguna" button
import { Button } from "@/components/ui/button";
import PenggunaProgramStudiOverview from "@/app/_components/pengguna/PenggunaProgramStudiOverview";

// Define props for the page, including dynamic params and search params
interface PenggunaProgramStudiPageProps {
  params: {
    id: string; // Dynamic segment: Program Studi ID from the URL (e.g., /admin/pengaturan/program-studi/123)
  };
  searchParams: Promise<SearchParams>; // Search parameters passed from Next.js (nuqs/server compatible)
}

export default async function PenggunaProgramStudiPage({
  params,
  searchParams: searchParamsPromise, // Renaming to avoid conflict with parsed searchParams
}: PenggunaProgramStudiPageProps) {
  // Authentication and Authorization check
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/auth/login"); // Redirect unauthenticated users
  }

  // Restrict access based on user role
  if (session.user.peran !== "ADMIN" && session.user.peran !== "SUPERADMIN") {
    redirect("/dashboard"); // Redirect unauthorized roles
  }

  const programStudiId = params.id; // Get Program Studi ID from URL params

  // Await and parse the search parameters using the nuqs schema
  const rawSearchParams = await searchParamsPromise;
  const parsedSearchParams = penggunaSearchParams.parse(rawSearchParams);

  // Fetch Program Studi details for display in the header
  const programStudi = await getProgramStudiById(programStudiId);

  // If program study not found, show 404 page
  if (!programStudi) {
    notFound();
  }

  // Fetch list of users for the specific Program Studi based on parsed search parameters
  // Use Awaited<ReturnType<...>> for dynamic type inference from the query function
  type PenggunaListResult = Awaited<
    ReturnType<typeof getPenggunaByProgramStudi>
  >;
  const {
    data: penggunaList,
    filtered, // Total filtered count (used for display, not pagination control here)
  }: PenggunaListResult = await getPenggunaByProgramStudi(
    programStudiId,
    parsedSearchParams
  );

  return (
    <div className="container mx-auto pb-2">
      <Card className="w-full shadow-lg rounded-xl border border-gray-200">
        <CardHeader className="pb-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-7 w-7 text-primary" />
              <CardTitle className="text-3xl font-extrabold text-gray-900 leading-tight">
                Daftar Pengguna
              </CardTitle>
            </div>
          </div>
          <CardDescription className="text-lg text-gray-700 mt-2 flex items-center">
            <Users className="mr-2 h-5 w-5 text-gray-600" /> Mengelola pengguna
            untuk{" "}
            <span className="font-semibold text-primary ml-1">
              {programStudi.displayName}
            </span>
          </CardDescription>
          <p className="text-sm text-gray-600 mt-2">
            Total Pengguna: <span className="font-semibold">{filtered}</span>
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Suspense boundary for the client component, showing a skeleton during loading */}
          <Suspense fallback={<DatatableSkeleton />}>
            <PenggunaProgramStudiOverview
              initialPenggunaList={penggunaList} // Pass the fetched user data
              programStudiDisplayName={programStudi.displayName} // Pass display name for UI
              programStudiId={programStudiId} // Pass ID for client-side links/actions
              currentSearchParams={rawSearchParams} // Pass raw search params to nuqs hooks in client component
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
