'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function usePageLoading() {
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Show loading on route change
    setIsLoading(true);
  }, [pathname]);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  return { isLoading, handleLoadingComplete };
}
