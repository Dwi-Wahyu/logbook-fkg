"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Fragment, JSX } from "react";
import Link from "next/link";
import { AdminSidebar } from "@/components/ui/admin-sidebar";

function capitalize(str: string): string {
  if (str.includes("-")) {
    const splitWord = str.split("-");
    const capitalizeEachWord = splitWord.map((val) => capitalize(val));

    return capitalizeEachWord.join(" ");
  }

  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function ClientAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname(); // contoh: "/admin/tugas"
  const segments = pathname.split("/").filter(Boolean);

  segments.shift();

  return (
    <div>
      <SidebarProvider>
        {/* <AppSidebar /> */}
        <AdminSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
            <div className="flex items-center">
              <SidebarTrigger className="-ml-1" />

              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  {(() => {
                    const items: JSX.Element[] = [];

                    segments.forEach((segment, idx) => {
                      const isLast = idx === segments.length - 1;
                      const href =
                        "/admin/" + segments.slice(0, idx + 1).join("/");

                      // Deteksi segment 'detail' atau 'edit'
                      if (segment === "detail" || segment === "edit") {
                        const entity = capitalize(segments[idx - 1] || "");
                        const label = `${capitalize(segment)} ${entity}`;

                        items.push(
                          <Fragment key={href}>
                            <BreadcrumbItem>
                              <BreadcrumbPage>{label}</BreadcrumbPage>
                            </BreadcrumbItem>
                          </Fragment>
                        );

                        // Skip UUID di belakang "detail" atau "edit"
                        return;
                      }

                      // Deteksi UUID (anggap segmen 36 karakter dan mengandung -)
                      if (segment.length === 36 && segment.includes("-")) {
                        // Lewati segmen UUID
                        return;
                      }

                      const label = capitalize(segment);
                      const item = (
                        <Fragment key={href}>
                          <BreadcrumbItem>
                            {isLast ? (
                              <BreadcrumbPage>{label}</BreadcrumbPage>
                            ) : (
                              <BreadcrumbLink asChild>
                                <Link href={href}>{label}</Link>
                              </BreadcrumbLink>
                            )}
                          </BreadcrumbItem>
                          {!isLast && <BreadcrumbSeparator />}
                        </Fragment>
                      );

                      items.push(item);
                    });

                    return items;
                  })()}
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <ThemeToggle />
          </header>
          <div className="p-5">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
