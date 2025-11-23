'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface PokemonLoadingProps {
  onComplete?: () => void;
  duration?: number; // in milliseconds
}

export function PokemonLoading({ onComplete, duration = 3000 }: PokemonLoadingProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          onComplete?.();
        }, 500);
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-b from-sky-400 via-sky-300 to-blue-200 overflow-hidden">
      {/* Animated background waves */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
      </div>

      {/* Floating clouds */}
      <div className="absolute top-10 left-10 cloud cloud1">☁️</div>
      <div className="absolute top-20 right-20 cloud cloud2">☁️</div>
      <div className="absolute top-32 left-1/3 cloud cloud3">☁️</div>

      {/* Main loading container */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Pikachu running */}
        <div className="relative w-full flex justify-center mb-4" style={{ height: '120px' }}>
          <div 
            className="pikachu-container"
            style={{ 
              transform: `translateX(${(progress - 50) * 4}px)`,
              transition: 'transform 0.1s linear'
            }}
          >
            <Image
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"
              alt="Pikachu"
              width={100}
              height={100}
              className="pikachu-image"
              priority
            />
          </div>
        </div>

        {/* Loading bar container */}
        <div className="loading-bar-container">
          <div className="loading-bar-bg">
            <div 
              className="loading-bar-fill"
              style={{ width: `${progress}%` }}
            ></div>
            <div className="loading-bar-shine"></div>
          </div>
          <div className="loading-text">Loading...</div>
        </div>

        {/* Percentage */}
        <div className="percentage-text">
          {Math.floor(progress)}%
        </div>
      </div>

      <style jsx>{`
        /* Waves animation */
        .wave {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 200%;
          height: 100px;
          background: linear-gradient(90deg, 
            rgba(59, 130, 246, 0.3) 0%,
            rgba(96, 165, 250, 0.3) 50%,
            rgba(59, 130, 246, 0.3) 100%
          );
          animation: wave-animation 3s ease-in-out infinite;
        }

        .wave1 {
          opacity: 0.7;
          animation-delay: 0s;
          animation-duration: 4s;
        }

        .wave2 {
          opacity: 0.5;
          animation-delay: -1s;
          animation-duration: 5s;
          height: 80px;
        }

        .wave3 {
          opacity: 0.3;
          animation-delay: -2s;
          animation-duration: 6s;
          height: 60px;
        }

        @keyframes wave-animation {
          0%, 100% {
            transform: translateX(0) translateY(0);
          }
          50% {
            transform: translateX(-25%) translateY(-10px);
          }
        }

        /* Clouds */
        .cloud {
          font-size: 3rem;
          animation: float 6s ease-in-out infinite;
          opacity: 0.7;
        }

        .cloud1 {
          animation-delay: 0s;
        }

        .cloud2 {
          animation-delay: -2s;
        }

        .cloud3 {
          animation-delay: -4s;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        /* Pikachu */
        .pikachu-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pikachu-image {
          animation: pikachu-run 0.3s steps(2) infinite, pikachu-bounce 0.5s ease-in-out infinite;
          filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.3));
        }

        @keyframes pikachu-run {
          0%, 100% {
            transform: scaleX(1) scaleY(1) rotate(-5deg);
          }
          25% {
            transform: scaleX(1.08) scaleY(0.92) rotate(0deg);
          }
          50% {
            transform: scaleX(1.05) scaleY(0.95) rotate(5deg);
          }
          75% {
            transform: scaleX(1.08) scaleY(0.92) rotate(0deg);
          }
        }

        @keyframes pikachu-bounce {
          0%, 100% {
            transform: translateY(0);
          }
          25% {
            transform: translateY(-10px);
          }
          50% {
            transform: translateY(-20px);
          }
          75% {
            transform: translateY(-10px);
          }
        }

        /* Loading bar */
        .loading-bar-container {
          position: relative;
          width: 400px;
          max-width: 90vw;
        }

        .loading-bar-bg {
          position: relative;
          width: 100%;
          height: 40px;
          background: linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%);
          border: 4px solid #fff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 
            0 4px 0 #0f172a,
            0 8px 16px rgba(0, 0, 0, 0.3),
            inset 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .loading-bar-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: linear-gradient(180deg, 
            #fbbf24 0%,
            #f59e0b 50%,
            #d97706 100%
          );
          transition: width 0.1s linear;
          box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.5);
          animation: pulse-glow 1.5s ease-in-out infinite;
        }

        @keyframes pulse-glow {
          0%, 100% {
            filter: brightness(1);
          }
          50% {
            filter: brightness(1.2);
          }
        }

        .loading-bar-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.3) 50%,
            transparent 100%
          );
          animation: shine 2s ease-in-out infinite;
        }

        @keyframes shine {
          0% {
            left: -100%;
          }
          100% {
            left: 200%;
          }
        }

        .loading-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-weight: bold;
          font-size: 1.125rem;
          text-shadow: 
            2px 2px 0 #0f172a,
            -1px -1px 0 #0f172a,
            1px -1px 0 #0f172a,
            -1px 1px 0 #0f172a;
          letter-spacing: 2px;
          animation: blink 1.5s ease-in-out infinite;
        }

        @keyframes blink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        /* Percentage */
        .percentage-text {
          font-size: 2rem;
          font-weight: bold;
          color: white;
          text-shadow: 
            3px 3px 0 #1e40af,
            -2px -2px 0 #1e40af,
            2px -2px 0 #1e40af,
            -2px 2px 0 #1e40af;
          animation: scale-pulse 1s ease-in-out infinite;
        }

        @keyframes scale-pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}
