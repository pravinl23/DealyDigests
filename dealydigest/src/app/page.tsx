"use client";

import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function Home() {
  const { user, error, isLoading } = useUser();

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <h1 className="mb-6 text-4xl font-bold text-primary">
        Welcome to DealyDigest
      </h1>
      <p className="mb-10 max-w-2xl text-center text-lg text-gray-600">
        Your personalized platform for discovering the best deals tailored to
        your preferences and spending habits.
      </p>

      {isLoading ? (
        <div>Loading...</div>
      ) : user ? (
        <div className="flex flex-col items-center">
          <p className="mb-4 text-xl font-medium">
            Welcome back, {user.name || user.email}!
          </p>
          <div className="flex gap-4">
            <Link
              href="/dashboard"
              className="rounded-lg bg-primary px-6 py-2 text-white hover:bg-primary-dark"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/deals"
              className="rounded-lg border border-primary px-6 py-2 text-primary hover:bg-gray-100"
            >
              View Deals
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <p className="mb-4 text-xl font-medium">
            Sign up or log in to get started
          </p>
          <div className="flex gap-4">
            <a
              href="/api/auth/login?screen_hint=signup"
              className="rounded-lg bg-primary px-6 py-2 text-white hover:bg-primary-dark"
            >
              Sign Up
            </a>
            <a
              href="/api/auth/login"
              className="rounded-lg border border-primary px-6 py-2 text-primary hover:bg-gray-100"
            >
              Log In
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
