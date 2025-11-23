'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { PokemonLoading } from './PokemonLoading';

export function PageLoadingWrapper({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    if (isFirstLoad) {
      // First load
      setIsFirstLoad(false);
      setIsLoading(true);
    } else {
      // Route change
      setIsLoading(true);
    }
  }, [pathname, isFirstLoad]);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  return (
    <>
      {isLoading && (
        <PokemonLoading 
          onComplete={handleLoadingComplete}
          duration={2000}
        />
      )}
      <div style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.3s' }}>
        {children}
      </div>
    </>
  );
}
