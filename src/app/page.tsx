"use client";

import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const { user, error, isLoading } = useUser();
  const router = useRouter();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-blue-50">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  // If user is logged in, don't render the login page (they'll be redirected by the useEffect)
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-blue-50">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
        <p className="ml-3">Redirecting to dashboard...</p>
      </div>
    );
  }

  // Login screen for non-logged in users
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl lg:text-6xl">
            Welcome to <span className="text-primary">DealyDigest</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
            Connect your favorite services and discover personalized recommendations tailored to your usage patterns.
          </p>
        </div>

        <div className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow-lg">
          <div className="mb-8 text-center">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">
              Your Connected Future Starts Here
            </h2>
            <p className="text-gray-600">
              Sign up to connect your accounts and discover personalized recommendations
            </p>
          </div>

          {/* How It Works Steps */}
          <div className="mb-10">
            <h3 className="mb-6 text-center text-xl font-medium text-gray-900">How It Works</h3>
            <div className="grid gap-8 md:grid-cols-3">
              <StepItem 
                number="1"
                title="Create an Account" 
                description="Sign up with your email and password to get started"
              />
              <StepItem 
                number="2"
                title="Connect Services" 
                description="Securely link services like DoorDash, Spotify, Netflix, and more"
              />
              <StepItem 
                number="3"
                title="Get Recommendations" 
                description="Receive personalized suggestions based on your activity"
              />
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-10 grid gap-6 md:grid-cols-2">
            <BenefitItem 
              title="Personalized Recommendations" 
              description="Get tailored suggestions based on your activity patterns"
            />
            <BenefitItem 
              title="Discover New Content" 
              description="Find music, shows, restaurants and more aligned with your tastes"
            />
            <BenefitItem 
              title="Private & Secure" 
              description="Your data is kept secure and private with industry-standard protection"
            />
            <BenefitItem 
              title="One Dashboard" 
              description="Manage all your connected services in one convenient place"
            />
          </div>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/api/auth/login?screen_hint=signup"
              className="w-full rounded-lg bg-primary px-6 py-3 text-center font-medium text-white shadow-md transition-all hover:bg-primary-dark hover:shadow-lg sm:w-auto"
            >
              Create Account
            </a>
            <a
              href="/api/auth/login"
              className="w-full rounded-lg border border-primary bg-white px-6 py-3 text-center font-medium text-primary transition-all hover:bg-gray-50 sm:w-auto"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function ServiceLogo({ name }: { name: string }) {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white p-3 shadow-sm">
      <div className="text-center text-sm font-medium text-gray-700">{name}</div>
    </div>
  );
}

function StepItem({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
        {number}
      </div>
      <h4 className="mb-2 font-medium text-gray-900">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

function FeatureCard({ title, description, icon, link }: { title: string; description: string; icon: string; link: string }) {
  return (
    <Link href={link} className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
        {icon === "dashboard" && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        )}
        {icon === "card" && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        )}
        {icon === "link" && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        )}
      </div>
      <h3 className="mb-2 text-lg font-medium text-gray-900 group-hover:text-primary">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </Link>
  );
}

function BenefitItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start">
      <div className="mr-4 mt-1 flex-shrink-0 text-green-500">
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
        </svg>
      </div>
      <div>
        <h4 className="font-medium text-gray-900">{title}</h4>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}
