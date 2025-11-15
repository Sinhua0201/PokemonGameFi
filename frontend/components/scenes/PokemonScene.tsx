'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PokemonScene({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/profile');
  }, [router]);

  return null;
}
