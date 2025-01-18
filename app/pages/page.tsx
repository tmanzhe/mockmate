"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Landing() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we have a token
    const token = document.cookie.includes('token=');
    if (!token) {
      router.push('/auth/login');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <main className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Welcome to MockMate Landing Page</h1>
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Your MockMate Overview</h2>
          <p>This is your authenticated landing page.</p>
          <button
            onClick={() => {
              // Clear the token cookie
              document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              router.push('/auth/login');
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </main>
  );
}