import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { UserProvider } from "@auth0/nextjs-auth0/client";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DealyDigest - Smart Deals For You",
  description: "Discover and manage your personalized deals",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}
      >
        <UserProvider>
          <Navbar />
          <main className="container mx-auto px-4 py-6">{children}</main>
        </UserProvider>
      </body>
    </html>
  );
}
