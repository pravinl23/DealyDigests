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
    console.log('Auth0 full user object:', JSON.stringify(user));
    
    if (user) {
      console.log('Auth0 user email:', user.email);
      setAuthenticated(true);
    } else if (!isLoading) {
      console.log('User not found but loading finished - possible auth issue');
      
      // Check session endpoint directly as a fallback
      fetch('/api/auth/me')
        .then(response => response.json())
        .then(data => {
          console.log('Session check from /api/auth/me:', data);
          if (data && data.email) {
            console.log('Found email from direct session check:', data.email);
            window.location.reload(); // Force a reload if we detect a session mismatch
          }
        })
        .catch(err => console.error('Error checking session:', err));
    }
  }, [user, isLoading]);

  // Try to reload once if we have auth issues
  useEffect(() => {
    // If we've been waiting for too long, force a page reload
    let authTimeout: NodeJS.Timeout;
    
    if (isLoading) {
      authTimeout = setTimeout(() => {
        console.log('Auth loading timeout - forcing refresh');
        window.location.reload();
      }, 5000); // 5 second timeout
    }
    
    return () => {
      if (authTimeout) clearTimeout(authTimeout);
    };
  }, [isLoading]);

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

  if (!user || !user.email) {
    console.log('No user or email from Auth0');
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
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Always use user.email directly
  const userEmail = user.email;
  console.log('Rendering CardsList with email:', userEmail);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Manage Your Cards</h1>
        {/* Only render CardsList when we have an email */}
        {userEmail ? (
          <>
            <p className="mb-4 text-green-600">Authenticated as: {userEmail}</p>
            <CardsList userEmail={userEmail} />
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">Could not retrieve your email. Please try again later.</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
            >
              Refresh Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 