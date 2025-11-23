'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to explore page
    router.push('/explore');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-purple-900 to-gray-900 flex items-center justify-center">
      <div className="text-white text-2xl">Redirecting to explore...</div>
    </div>
  );
}
