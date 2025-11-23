'use client';

import dynamic from 'next/dynamic';
import { WalletGuard } from '@/components/WalletGuard';
import { Suspense } from 'react';
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic';
import { PokemonLoading } from '@/components/PokemonLoading';

const IslandExplore = dynamic(() => import('@/components/scenes/IslandExplore'), {
  ssr: false,
  loading: () => <PokemonLoading duration={2000} />,
});

export default function ExplorePage() {
  const { isPlaying, isMuted, togglePlay, toggleMute } = useBackgroundMusic('/music/Map.mp3', {
    volume: 0.3,
    loop: true,
    autoPlay: true,
  });

  return (
    <WalletGuard>
      {/* Music Controls - Moved to bottom right to avoid overlap */}
      <div className="fixed bottom-4 right-4 z-50 flex gap-2">
        <button
          onClick={togglePlay}
          className="bg-white/90 hover:bg-white backdrop-blur-md text-gray-800 p-3 rounded-xl shadow-lg transition-all hover:scale-110 border border-gray-200/50"
          title={isPlaying ? 'Pause Music' : 'Play Music'}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        <button
          onClick={toggleMute}
          className="bg-white/90 hover:bg-white backdrop-blur-md text-gray-800 p-3 rounded-xl shadow-lg transition-all hover:scale-110 border border-gray-200/50"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>

      <Suspense fallback={<PokemonLoading duration={2000} />}>
        <IslandExplore />
      </Suspense>
    </WalletGuard>
  );
}
