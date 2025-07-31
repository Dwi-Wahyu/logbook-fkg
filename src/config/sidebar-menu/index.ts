// src/lib/sidebar-menu/index.ts
import { mahasiswaSidebarMenu } from "./mahasiswa";
import { dosenSidebarMenu } from "./dosen";
import { adminSidebarMenu } from "./admin";
import { superAdminSidebarMenu } from "./superadmin";

export const sidebarMenu = {
  MAHASISWA: mahasiswaSidebarMenu,
  DOSEN: dosenSidebarMenu,
  ADMIN: adminSidebarMenu,
  SUPERADMIN: superAdminSidebarMenu,
};
