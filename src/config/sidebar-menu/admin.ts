import { SidebarMenu } from "@/types/sidebar";
import {
  BookOpenCheck,
  BookType,
  LayoutDashboard,
  Users,
  UsersRound,
  UserPlus,
} from "lucide-react";

export const adminSidebarMenu: SidebarMenu = {
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
      ],
    },
    {
      title: "Pengguna",
      url: "/admin/pengguna",
      items: [
        {
          title: "Dosen",
          url: "dosen",
          icon: UsersRound,
          isDropdown: false,
          items: [],
        },
        {
          title: "Mahasiswa",
          url: "mahasiswa",
          icon: Users,
          isDropdown: false,
          items: [],
        },
        {
          title: "Tambah Pengguna",
          url: "tambah-pengguna",
          icon: UserPlus,
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
          title: "Program Studi",
          url: "program-studi",
          icon: BookType,
          isDropdown: false,
          items: [],
        },
        {
          title: "Mata Kuliah",
          url: "mata-kuliah",
          icon: BookOpenCheck,
          isDropdown: false,
          items: [],
        },
      ],
    },
  ],
};
