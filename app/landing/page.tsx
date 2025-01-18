"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Landing() {
  const router = useRouter();
  return (
    <main className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Welcome to MockMate Landing Page</h1>
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Your MockMate Overview</h2>
          <p>This is your authenticated landing page.</p>
        </div>
      </div>
    </main>
  );
}
