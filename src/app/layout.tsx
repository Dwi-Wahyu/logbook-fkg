import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

import NextTopLoader from "nextjs-toploader";

import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "Logbook FKG-UH",
  description:
    "Aplikasi logbook digital resmi Fakultas Kedokteran Gigi Universitas Hasanuddin untuk pencatatan kegiatan akademik dan klinik mahasiswa secara terintegrasi.",
};

const geist = Geist({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.className}  antialiased`}>
        <NextTopLoader
          color="#2299DD"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          easing="ease"
          speed={200}
          shadow="0 0 10px #2299DD,0 0 5px #2299DD"
          zIndex={1600}
          showAtBottom={false}
        />

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>{children}</SessionProvider>
        </ThemeProvider>

        <Toaster closeButton />
      </body>
    </html>
  );
}
