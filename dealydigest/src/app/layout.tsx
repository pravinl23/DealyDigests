import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import PageTransition from "@/components/page-transition";
import Script from "next/script";

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
      <head>
        {/* Add any critical scripts here */}
      </head>
      <body
        className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}
      >
        <UserProvider>
          <Navbar />
          <PageTransition>
            <main className="container mx-auto px-4 py-6">{children}</main>
          </PageTransition>
        </UserProvider>
        
        {/* Load the Knot SDK globally using Next.js Script component */}
        <Script
          src="https://cdn.knotapi.com/sdk/latest/knot.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
