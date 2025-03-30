'use client';

import { CardsList } from "@/components/card-display";
import { useUser } from '@auth0/nextjs-auth0/client';
import { useEffect, useState } from 'react';

export default function CardsPage() {
  console.log('CardsPage rendering');
  const { user, error, isLoading } = useUser();
  const [authenticated, setAuthenticated] = useState(false);
  
  // Log the Auth0 user data to debug
  useEffect(() => {
    // Detailed debug log to see exactly what Auth0 is returning
    console.log('Auth0 full user object:', user);
    
    if (user) {
      console.log('Auth0 user sub (id):', user.sub);
      console.log('Auth0 user email:', user.email);
      setAuthenticated(true);
    }
  }, [user]);

  if (isLoading) {
    console.log('Auth0 is loading...');
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Manage Your Cards</h1>
          <div className="text-center py-8">
            <p className="text-gray-600">Loading user information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Auth0 error:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Manage Your Cards</h1>
          <div className="text-center py-8">
            <p className="text-red-600">Error: {error.message}</p>
            <button 
              onClick={() => window.location.href = '/api/auth/login'}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Try Logging In Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('No user from Auth0');
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Manage Your Cards</h1>
          <div className="text-center py-8">
            <p className="text-gray-600">Please log in to view your cards</p>
            <div className="flex flex-col gap-4 mt-4 items-center">
              <a href="/api/auth/login" className="px-4 py-2 bg-blue-600 text-white rounded-md">
                Log In
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Manage Your Cards</h1>
        <p className="mb-4 text-green-600">Authenticated as: {user.email}</p>
        <CardsList />
      </div>
    </div>
  );
} 