import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import PageTransition from "@/components/page-transition";
import Script from "next/script";
import { initializeScheduler } from "./api/startup";
import { Providers } from './providers';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DealyDigest - Smart Deals For You",
  description: "Discover and manage your personalized deals",
};

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize scheduler on server side
  if (typeof window === "undefined") {
    initializeScheduler();
  }

  return (
    <html lang="en">
      <head>{/* Add any critical scripts here */}</head>
      <body
        className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}
      >
        <Providers>
          <Navbar />
          <PageTransition>
            <main className="container mx-auto px-4 py-6">{children}</main>
          </PageTransition>
        </Providers>

        {/* Load the Knot SDK globally using Next.js Script component */}
        <Script
          src="https://cdn.knotapi.com/sdk-platform/v1.0/sdk.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
