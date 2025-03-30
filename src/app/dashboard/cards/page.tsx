'use client';

import { CardsList } from "@/components/card-display";
import { useEffect, useState } from "react";

export default function CardsPage() {
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    // TODO: Replace this with actual user authentication
    // For now, we'll use a placeholder email
    setUserEmail("johndoe@example.com");
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Manage Your Cards</h1>
        {userEmail ? (
          <CardsList userEmail={userEmail} />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">Please log in to view your cards.</p>
          </div>
        )}
      </div>
    </div>
  );
} 