import CookieConsent from "@/components/cookie-consent";
import Footer from "@/components/footer";
import { MainNav } from "@/components/nav/main-nav";
import { ReactQueryClientProvider } from "@/components/react-query-client-provider";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { siteConfig } from "@/config/site";
import "@/styles/globals.css";
import { uploadRouter } from "@/uploadthing/server";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import type { Metadata } from "next";
import React from "react";
import { extractRouterConfig } from "uploadthing/server";

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextSSRPlugin routerConfig={extractRouterConfig(uploadRouter)} />
          <header className="flex w-full shrink-0 items-center px-4 py-4 md:px-6">
            <MainNav items={siteConfig.mainNav} />
          </header>
          <ReactQueryClientProvider>
            <main className="flex-1 overflow-hidden">{children}</main>
          </ReactQueryClientProvider>
          <Footer />
          <Toaster />
          <CookieConsent />
          <TailwindIndicator />
        </ThemeProvider>
      </body>
    </html>
  );
}
