// src/app/admin/kegiatan/detail/_components/CatatanList.tsx
"use client";

import { format } from "date-fns";
import { MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getNameInitials } from "@/service/getNameInitials";
import { KegiatanWithRelations } from "@/app/_lib/queries/kegiatanQueries"; // Import type

interface CatatanListProps {
  catatan: KegiatanWithRelations["Catatan"]; // Ambil array catatan dari KegiatanWithRelations
}

export default function CatatanList({ catatan }: CatatanListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        Catatan ({catatan.length})
      </h2>
      {catatan.length > 0 ? (
        <div className="space-y-4">
          {catatan.map((catatanItem) => (
            <div
              key={catatanItem.id}
              className="flex items-start space-x-3 p-4 border rounded-md bg-gray-50 shadow-sm"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={`/image/profile-picture/${catatanItem.pengguna.avatar}`}
                  alt={catatanItem.pengguna.nama}
                />
                <AvatarFallback>
                  {getNameInitials(catatanItem.pengguna.nama)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-gray-900 text-sm">
                    {catatanItem.pengguna.nama}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(
                      new Date(catatanItem.createdAt),
                      "dd MMM yy, HH:mm"
                    )}
                  </span>
                </div>
                <p className="text-gray-700 text-sm">{catatanItem.konten}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm p-4 border rounded-md bg-gray-50">
          Belum ada catatan untuk kegiatan ini.
        </p>
      )}
    </div>
  );
}
