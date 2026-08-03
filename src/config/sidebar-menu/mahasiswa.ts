import { SidebarMenu } from "@/types/sidebar";
import {
  Activity,
  Bell,
  CircleDashed,
  FileUser,
  LayoutDashboard,
  ScrollText,
} from "lucide-react";

export const mahasiswaSidebarMenu: SidebarMenu = {
  navMain: [
    {
      title: "Utama",
      url: "/admin",
      items: [
        {
          title: "Dashboard",
          url: "dashboard",
          icon: LayoutDashboard,
          isDropdown: false,
          items: [],
        },
        {
          title: "Pengajuan Bimbingan",
          url: "pengajuan-bimbingan",
          icon: FileUser,
          isDropdown: false,
          items: [],
        },
        {
          title: "Progress Kegiatan",
          url: "kegiatan/progress",
          icon: CircleDashed,
          isDropdown: false,
          items: [],
        },
        {
          title: "Logbook Anda",
          url: "logbook-anda",
          icon: ScrollText,
          isDropdown: false,
          items: [],
        },
        {
          title: "Kegiatan",
          url: "kegiatan",
          icon: Activity,
          isDropdown: true,
          items: [], // akan diisi dinamis sesuai semester
        },
      ],
    },
  ],
};
