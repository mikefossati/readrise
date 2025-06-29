import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">ReadRise App</h1>
      <nav className="flex flex-col gap-4">
        <Link href="/TimerTestPage" legacyBehavior>
          <a className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold">Go to Timer Test Page</a>
        </Link>
        {/* Add other navigation links here as needed */}
      </nav>
    </main>
  );
}
