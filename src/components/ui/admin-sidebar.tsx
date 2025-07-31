"use client";

import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { NavUser } from "./nav-user";
import { useSession } from "next-auth/react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";

import Image from "next/image";
import { getSidebarMenu } from "@/lib/get-sidebar-menu";
import { SidebarSkeleton } from "../sidebar-skeleton";

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const [activeLink, setActiveLink] = React.useState("/admin/dashboard");
  const { data: session, status } = useSession();

  function getLink(...links: string[]): string {
    return links.join("/");
  }

  function getLinkWithSearchParams(...links: string[]): string {
    const lastPart = links.pop(); // ambil dan hapus bagian terakhir
    if (!lastPart) return "";

    const basePath = links.join("/").replace(/\/+$/, ""); // gabungkan bagian sebelumnya
    const [path, query] = lastPart.split("?"); // pisahkan path dan query
    const fullPath = `${basePath}/${path}`.replace(/\/+/g, "/"); // pastikan tidak ada double slash

    return query ? `${fullPath}?${query}` : fullPath;
  }

  if (!session?.user) {
    return (
      <Sidebar {...props}>
        <SidebarSkeleton />
      </Sidebar>
    );
  }

  const menuData = getSidebarMenu(session.user.peran, session.user.semester);

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-center mt-2 gap-2">
          <Image
            src="/logo-unhas.png"
            alt="Logo Unhas"
            width={30}
            height={30}
          />
          <h1 className="font-bold text-lg">LOGBOOK FKG</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {menuData.navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((nav) =>
                  nav.isDropdown ? (
                    <Collapsible
                      defaultOpen
                      key={nav.title}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger className="cursor-pointer" asChild>
                          <SidebarMenuButton>
                            <nav.icon />
                            {nav.title}

                            <span className="ml-auto">
                              <ChevronRight className="w-4 h-4 collapsible-chevron" />
                            </span>
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {nav.items.map((subnav) => (
                              <SidebarMenuSubItem key={subnav.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  className="cursor-pointer"
                                  isActive={
                                    getLink(group.url, nav.url, subnav.url) ===
                                    activeLink
                                  }
                                  onClick={() =>
                                    setActiveLink(
                                      getLink(group.url, nav.url, subnav.url)
                                    )
                                  }
                                >
                                  {subnav.isQuery ? (
                                    <Link
                                      href={getLinkWithSearchParams(
                                        group.url,
                                        nav.url,
                                        subnav.url
                                      )}
                                    >
                                      {subnav.title}
                                    </Link>
                                  ) : (
                                    <Link
                                      href={getLink(
                                        group.url,
                                        nav.url,
                                        subnav.url
                                      )}
                                    >
                                      {subnav.title}
                                    </Link>
                                  )}
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  ) : (
                    <SidebarMenuItem key={nav.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={getLink(group.url, nav.url) === activeLink}
                        onClick={() =>
                          setActiveLink(getLink(group.url, nav.url))
                        }
                      >
                        <Link href={getLink(group.url, nav.url)}>
                          <nav.icon />
                          {nav.title}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={session.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
