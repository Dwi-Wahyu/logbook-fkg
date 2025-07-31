import { SidebarMenu } from "@/types/sidebar";
import {
  Activity,
  BookType,
  FileUser,
  LayoutDashboard,
  SquareUserRound,
} from "lucide-react";

export const dosenSidebarMenu: SidebarMenu = {
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
          title: "Permohonan Bimbingan",
          url: "permohonan-bimbingan",
          icon: FileUser,
          isDropdown: false,
          items: [],
        },
        {
          title: "Kegiatan",
          url: "kegiatan",
          icon: Activity,
          isDropdown: false,
          items: [],
        },
      ],
    },
    {
      title: "Pengguna",
      url: "/admin/pengguna",
      items: [
        {
          title: "Mahasiswa Bimbingan",
          url: "mahasiswa-bimbingan",
          icon: SquareUserRound,
          isDropdown: false,
          items: [],
        },
      ],
    },
    {
      title: "Pengaturan",
      url: "/admin/pengaturan",
      items: [
        {
          title: "Mata Kuliah",
          url: "mata-kuliah",
          icon: BookType,
          isDropdown: false,
          items: [],
        },
      ],
    },
  ],
};
