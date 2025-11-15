'use client';

import dynamic from 'next/dynamic';
import { WalletGuard } from '@/components/WalletGuard';
import { Suspense } from 'react';
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic';

const IslandExplore = dynamic(() => import('@/components/scenes/IslandExplore'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-b from-blue-900 via-purple-900 to-pink-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4" />
        <div className="text-white text-2xl font-bold">Loading 3D Island...</div>
        <p className="text-gray-300 mt-2">Preparing your adventure</p>
      </div>
    </div>
  ),
});

export default function ExplorePage() {
  const { isPlaying, isMuted, togglePlay, toggleMute } = useBackgroundMusic('/music/Map.mp3', {
    volume: 0.3,
    loop: true,
    autoPlay: true,
  });

  return (
    <WalletGuard>
      {/* Music Controls */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={togglePlay}
          className="bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all hover:scale-110"
          title={isPlaying ? 'Pause Music' : 'Play Music'}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        <button
          onClick={toggleMute}
          className="bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all hover:scale-110"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>

      <Suspense fallback={
        <div className="w-full h-screen flex items-center justify-center bg-gradient-to-b from-blue-900 via-purple-900 to-pink-900">
          <div className="text-white text-2xl">Loading...</div>
        </div>
      }>
        <IslandExplore />
      </Suspense>
    </WalletGuard>
  );
}
