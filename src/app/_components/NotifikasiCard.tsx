"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  findAllNotifikasi,
  hapusNotifikasi,
} from "../_lib/actions/notifikasiAction";
import { Fragment, useState } from "react";
import { Bell, X } from "lucide-react";

export default function NotifikasiCard({
  allNotifikasi,
}: {
  allNotifikasi: Awaited<ReturnType<typeof findAllNotifikasi>>;
}) {
  function handleHapus(id: string) {
    const actions = hapusNotifikasi(id);
  }

  return (
    <Card className="mt-6">
      {allNotifikasi.data?.length ? (
        <Fragment>
          <CardHeader>
            <CardTitle>Notifikasi Anda</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {allNotifikasi.data?.map((notif) => (
              <div
                key={notif.id}
                className="pb-2 flex justify-between gap-1 items-center border-b last:border-b-0"
              >
                <div>
                  <h1 className="font-semibold text-sm">{notif.judul}</h1>
                  <h1 className="text-sm text-muted-foreground">
                    {notif.pesan}
                  </h1>
                </div>

                <button onClick={() => handleHapus(notif.id)}>
                  <X width={15} height={15} />
                </button>
              </div>
            ))}
          </CardContent>
        </Fragment>
      ) : (
        <CardContent className="flex flex-col gap-2 items-center justify-center">
          <h1 className="font-semibold">Belum Ada Notifikasi Terbaru</h1>

          <Bell width={70} height={70} />
        </CardContent>
      )}
    </Card>
  );
}
