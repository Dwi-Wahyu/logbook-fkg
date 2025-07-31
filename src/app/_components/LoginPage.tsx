"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import LoginForm from "./LoginForm";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Fragment } from "react";

function DesktopView() {
  return (
    <div className="md:grid hidden w-full h-screen grid-cols-6">
      <div className="col-span-4 relative bg-[url('/bg-login.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/20  dark:bg-black/10"></div>
        <div className="relative z-10 flex p-5 h-full">
          <div className="flex gap-2 items-center h-fit">
            <Image
              src="/logo-unhas.png"
              width={40}
              height={30}
              alt="logo-unhas"
            />
            <div>
              <h1 className="font-semibold dark:text-muted-foreground">
                Fakultas Kedokteran Gigi
              </h1>
              <h1 className="text-sm dark:text-muted-foreground">
                Universitas Hasanuddin
              </h1>
            </div>
          </div>
        </div>
      </div>
      <div className="col-span-2">
        <LoginForm />
      </div>
    </div>
  );
}

function MobileView() {
  return (
    <div className="md:hidden relative bg-[url('/bg-login.jpg')] bg-cover bg-center w-full h-screen flex flex-col justify-between">
      {/* Overlay dengan z-0 */}
      <div className="absolute inset-0 dark:bg-black/80 z-0"></div>

      {/* Header dengan z-10 */}
      <div className="relative z-10 flex pt-6 pl-6 gap-2 items-center">
        <Image
          src="/logo-unhas.png"
          width={30}
          height={20}
          alt="logo-unhas"
          className="object-contain"
        />
        <div>
          <h1 className="font-semibold text-sm ">Fakultas Kedokteran Gigi</h1>
          <h1 className="text-sm ">Universitas Hasanuddin</h1>
        </div>
      </div>

      {/* LoginForm dengan z-10 */}
      <div className="relative z-10 bg-white dark:bg-accent rounded-t-[2rem] min-h-[70vh] shadow-xl py-10">
        <LoginForm />

        <div className="flex justify-center mb-10 text-sm">
          © {new Date().getFullYear()} PT SkytelIndo
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div>
      <MobileView />

      <DesktopView />
    </div>
  );
}
