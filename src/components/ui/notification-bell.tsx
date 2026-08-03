"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { countUnreadNotifikasi } from "@/app/_lib/actions/notifikasiAction";
import { useSession } from "next-auth/react";

export default function NotificationBell() {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (session?.user?.id) {
      countUnreadNotifikasi(session.user.id).then((res) => {
        if (res.success && typeof res.count === "number") {
          setUnreadCount(res.count);
        }
      });
    }
  }, [session?.user?.id]);

  return (
    <Link href="/admin/notifikasi" title="Halaman Notifikasi">
      <Button
        variant="ghost"
        size="icon"
        className="relative text-gray-700 hover:text-gray-900 rounded-full"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
        )}
        <span className="sr-only">Halaman Notifikasi</span>
      </Button>
    </Link>
  );
}
