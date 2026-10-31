import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ACNHPocketPokeProvider } from "@/context/ACNHPocketPokeContext";
import { Toaster } from "@/components/ui/toast";
import AppHeaderV2 from "@/components/v2-components/AppHeaderV2";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ACNH Pocket Poke",
  description: "Edit and send Animal Crossing: New Horizons pocket inventories.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background">
        <ACNHPocketPokeProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <AppHeaderV2 />
            {children}
            <Toaster />
          </ThemeProvider>
        </ACNHPocketPokeProvider>
      </body>
    </html>
  );
}
