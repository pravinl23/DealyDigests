"use client";

import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const { user, error, isLoading } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-primary/95 backdrop-blur-sm shadow-lg" : "bg-primary"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 transition-transform hover:scale-105"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded bg-white text-primary">
              <CreditCardIcon className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-white">DealyDigest</span>
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-white hover:text-gray-300 transition-colors"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {isLoading ? (
              <div className="text-white animate-pulse">Loading...</div>
            ) : user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-3 ml-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500 text-white transition-transform hover:scale-105">
                    <span className="text-lg font-medium">
                      {user.name?.charAt(0) || user.email?.charAt(0) || "?"}
                    </span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="font-medium text-white">
                      {user.name || user.email}
                    </p>
                    {user.email && (
                      <p className="text-xs text-gray-300">{user.email}</p>
                    )}
                  </div>
                </div>
                <a
                  href="/api/auth/logout"
                  className="ml-4 rounded-lg border border-gray-700 px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                >
                  Logout
                </a>
              </>
            ) : (
              <>
                <a
                  href="/api/auth/login"
                  className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                >
                  Login
                </a>
                <a
                  href="/api/auth/login?screen_hint=signup"
                  className="rounded-lg bg-white px-4 py-2 text-sm text-primary hover:bg-gray-200 transition-colors"
                >
                  Sign Up
                </a>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`lg:hidden transition-all duration-300 ease-in-out ${
            isOpen
              ? "max-h-96 opacity-100 py-4"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          {!isLoading && (
            <div className="flex flex-col gap-4">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-white hover:text-gray-300 transition-colors py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <div className="flex items-center gap-3 py-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500 text-white">
                      <span className="text-lg font-medium">
                        {user.name?.charAt(0) || user.email?.charAt(0) || "?"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {user.name || user.email}
                      </p>
                      {user.email && (
                        <p className="text-xs text-gray-300">{user.email}</p>
                      )}
                    </div>
                  </div>
                  <a
                    href="/api/auth/logout"
                    className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors text-center"
                  >
                    Logout
                  </a>
                </>
              ) : (
                <>
                  <a
                    href="/api/auth/login"
                    className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors text-center"
                  >
                    Login
                  </a>
                  <a
                    href="/api/auth/login?screen_hint=signup"
                    className="rounded-lg bg-white px-4 py-2 text-sm text-primary hover:bg-gray-200 transition-colors text-center"
                  >
                    Sign Up
                  </a>
                </>
              )}
            </div>
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
