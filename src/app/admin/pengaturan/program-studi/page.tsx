// src/app/admin/program-studi/page.tsx
import { Suspense } from "react";
import Link from "next/link";
import { Loader2, Eye, SquarePen } from "lucide-react"; // Import new icons

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge"; // Assuming you have a Badge component (shadcn/ui or similar)

import { getAllProgramStudi } from "@/app/_lib/queries/programStudiQueries";
import { auth } from "@/config/auth";
import { redirect } from "next/navigation";

// A simple skeleton for loading state
const ProgramStudiTableSkeleton = () => (
  <div className="flex justify-center items-center h-40">
    <Loader2 className="animate-spin h-8 w-8 text-primary" />
    <span className="ml-2 text-gray-500">Memuat daftar program studi...</span>
  </div>
);

export default async function DaftarProgramStudi() {
  // Ensure user is authenticated and authorized (e.g., ADMIN or SUPERADMIN)
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/auth/login"); // Redirect if no session
  }

  if (session.user.peran === "ADMIN" && session.user.peran) {
    redirect(
      "/admin/pengaturan/program-studi/detail/" + session.user.programStudiId
    );
  }

  // Check user role for authorization to view this page
  // Adjust roles as per your application's authorization logic
  if (session.user.peran !== "ADMIN" && session.user.peran !== "SUPERADMIN") {
    // Redirect to an unauthorized page or dashboard
    redirect("/dashboard"); // Or show an access denied message
  }

  // Fetch program studi data
  const programStudiList = await getAllProgramStudi();

  return (
    <div className="container mx-auto">
      <Card className="w-full shadow-lg rounded-xl">
        <CardHeader className="flex justify-between">
          <div>
            <CardTitle className="">Daftar Program Studi</CardTitle>
            <CardDescription className="mt-2">
              Kelola data program studi dan field kustomnya dengan mudah.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Suspense fallback={<ProgramStudiTableSkeleton />}>
            {programStudiList.length === 0 ? (
              <div className="text-center p-8 text-gray-500 text-lg">
                Tidak ada program studi yang ditemukan.
              </div>
            ) : (
              <div className="relative w-full overflow-auto rounded-lg border border-gray-200 shadow-sm">
                {/* Refined border and shadow */}
                <Table className="min-w-full bg-white">
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b border-gray-200">
                      {/* Light background for header */}
                      <TableHead className="w-[50px] font-bold text-gray-700">
                        No
                      </TableHead>
                      <TableHead className="font-bold text-gray-700">
                        Nama Program Studi
                      </TableHead>
                      <TableHead className="text-center font-bold text-gray-700">
                        Aksi
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {programStudiList.map((programStudi, index) => {
                      const canEditProgramStudi =
                        session.user.programStudiId === programStudi.id ||
                        session.user.peran === "SUPERADMIN";

                      return (
                        <TableRow
                          key={programStudi.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <TableCell className="font-medium text-gray-800">
                            {index + 1}
                          </TableCell>
                          <TableCell className="text-gray-800">
                            {programStudi.nama}
                          </TableCell>

                          <TableCell className="text-center">
                            <div className="flex justify-center space-x-2">
                              <Link
                                href={`/admin/pengaturan/program-studi/detail/${programStudi.id}`}
                              >
                                <Button variant="outline">
                                  <Eye className="h-4 w-4" />
                                  Detail
                                </Button>
                              </Link>
                              {canEditProgramStudi && (
                                <Link
                                  href={`/admin/pengaturan/program-studi/edit/${programStudi.id}`}
                                >
                                  <Button variant="outline">
                                    <SquarePen className="h-4 w-4" />
                                    Edit
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
