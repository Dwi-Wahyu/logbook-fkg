// src/types/sidebar.ts
import { LucideIcon } from "lucide-react";

export type SidebarSubItem = {
  title: string;
  url: string;
  isQuery?: boolean;
};

export type SidebarMenuItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  isDropdown: boolean;
  items: SidebarSubItem[];
};

export type SidebarGroup = {
  title: string;
  url: string;
  items: SidebarMenuItem[];
};

export type SidebarMenu = {
  navMain: SidebarGroup[];
};
