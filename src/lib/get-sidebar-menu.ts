import { sidebarMenu } from "../config/sidebar-menu";

type SidebarRoles = keyof typeof sidebarMenu;

export function getSidebarMenu(peran: string, semester?: number) {
  const upperPeran = peran.toUpperCase() as SidebarRoles;
  const menu = sidebarMenu[upperPeran];

  if (!menu) {
    throw new Error(`Sidebar menu not defined for role: ${upperPeran}`);
  }

  // Jika peran MAHASISWA dan semester tersedia → isi item kegiatan secara dinamis
  if (upperPeran === "MAHASISWA" && semester) {
    const kegiatanItem = menu.navMain
      .flatMap((group) => group.items)
      .find((item) => item.title === "Kegiatan");

    if (kegiatanItem && Array.isArray(kegiatanItem.items)) {
      kegiatanItem.items = Array.from({ length: semester }, (_, i) => ({
        title: `Semester ${i + 1}`,
        url: `?semester=${i + 1}`,
        isQuery: true,
      }));
    }
  }

  return menu;
}
