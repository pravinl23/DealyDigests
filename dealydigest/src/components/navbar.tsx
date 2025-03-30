"use client";

import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";

export function Navbar() {
  const { user, error, isLoading } = useUser();

  return (
    <nav className="bg-primary text-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-white text-primary">
            <CreditCardIcon className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold">DealyDigest</span>
        </Link>

        <div className="flex items-center gap-4">
          {isLoading ? (
            <div>Loading...</div>
          ) : user ? (
            <>
              <Link href="/dashboard" className="hover:text-gray-300">
                Dashboard
              </Link>
              <Link href="/deals" className="hover:text-gray-300">
                Deals
              </Link>
              <Link href="/account" className="hover:text-gray-300">
                Account
              </Link>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500 text-white">
                  <span className="text-lg font-medium">
                    {user.name?.charAt(0) || user.email?.charAt(0) || "?"}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{user.name || user.email}</p>
                  {user.email && (
                    <p className="text-xs text-gray-300">{user.email}</p>
                  )}
                </div>
              </div>
              <a
                href="/api/auth/logout"
                className="rounded-lg border border-gray-700 px-3 py-1.5 text-sm hover:bg-primary-light"
              >
                Logout
              </a>
            </>
          ) : (
            <>
              <Link href="/deals" className="hover:text-gray-300">
                Deals
              </Link>
              <a
                href="/api/auth/login"
                className="rounded-lg border border-gray-700 px-3 py-1.5 text-sm hover:bg-primary-light"
              >
                Login
              </a>
              <a
                href="/api/auth/login?screen_hint=signup"
                className="rounded-lg bg-white px-3 py-1.5 text-sm text-primary hover:bg-gray-200"
              >
                Sign Up
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function CreditCardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}
