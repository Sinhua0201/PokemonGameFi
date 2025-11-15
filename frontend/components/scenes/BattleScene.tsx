'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function BattleScene({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  
  useEffect(() => {
    // 直接跳转到 battle 页面
    router.push('/battle');
  }, [router]);

  return null;
}
