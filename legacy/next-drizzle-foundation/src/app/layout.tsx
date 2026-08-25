import type { Metadata } from "next";

import { storeConfig } from "@/config/store";

import "./globals.css";

export const metadata: Metadata = {
  title: storeConfig.name,
  description: `${storeConfig.tagline}. Account-based commerce for the Philippines.`,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
