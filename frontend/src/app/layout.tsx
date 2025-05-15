import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/sidebar";
import Header from "@/components/internal/Header";
import { StarknetProvider } from "@/components/StarknetProvider";
import { WalletProvider } from "@/components/lib/WalletProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Digital Rights Management",
  description:
    "Advanced Digital Rights Management for Media & Content Creators",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StarknetProvider>
          <WalletProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 overflow-auto p-6">{children}</main>
              </div>
            </div>
          </WalletProvider>
        </StarknetProvider>
      </body>
    </html>
  );
}
