'use client';

import { useEffect, useState } from 'react';

interface DamageNumberProps {
  damage: number;
  x: number;
  y: number;
  effectiveness?: number;
  critical?: boolean;
}

export function DamageNumber({ damage, x, y, effectiveness = 1, critical = false }: DamageNumberProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const getColor = () => {
    if (critical) return 'text-red-500';
    if (effectiveness > 1) return 'text-green-500';
    if (effectiveness < 1) return 'text-gray-500';
    return 'text-white';
  };

  const getSize = () => {
    if (critical) return 'text-4xl';
    if (effectiveness > 1) return 'text-3xl';
    return 'text-2xl';
  };

  return (
    <div
      className={`absolute ${getColor()} ${getSize()} font-bold animate-float-up pointer-events-none drop-shadow-lg`}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      -{damage}
      {critical && <span className="text-xl ml-1">CRIT!</span>}
    </div>
  );
}

interface AttackEffectProps {
  type: 'fire' | 'water' | 'grass' | 'electric' | 'normal';
  position: 'left' | 'right';
}

export function AttackEffect({ type, position }: AttackEffectProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const getEffect = () => {
    switch (type) {
      case 'fire':
        return '🔥';
      case 'water':
        return '💧';
      case 'grass':
        return '🍃';
      case 'electric':
        return '⚡';
      default:
        return '💥';
    }
  };

  return (
    <div
      className={`absolute ${
        position === 'left' ? 'left-1/4' : 'right-1/4'
      } top-1/2 transform -translate-y-1/2 text-6xl animate-ping pointer-events-none`}
    >
      {getEffect()}
    </div>
  );
}

interface ShakeAnimationProps {
  children: React.ReactNode;
  trigger: boolean;
}

export function ShakeAnimation({ children, trigger }: ShakeAnimationProps) {
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 500);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <div className={isShaking ? 'animate-shake' : ''}>
      {children}
    </div>
  );
}

interface BattlePokemonSpriteProps {
  src: string;
  alt: string;
  isPlayer?: boolean;
  isAttacking?: boolean;
  isFainted?: boolean;
}

export function BattlePokemonSprite({ src, alt, isPlayer = false, isAttacking = false, isFainted = false }: BattlePokemonSpriteProps) {
  return (
    <div className="relative">
      <img
        src={src}
        alt={alt}
        className={`
          pixelated w-32 h-32 object-contain
          ${isPlayer ? '' : 'transform scale-x-[-1]'}
          ${isAttacking ? 'animate-bounce-slow' : ''}
          ${isFainted ? 'opacity-30 grayscale' : ''}
          transition-all duration-300
        `}
      />
      {isAttacking && (
        <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full" />
      )}
    </div>
  );
}

interface EffectivenessIndicatorProps {
  effectiveness: number;
}

export function EffectivenessIndicator({ effectiveness }: EffectivenessIndicatorProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible || effectiveness === 1) return null;

  const getMessage = () => {
    if (effectiveness > 1) return "It's super effective!";
    if (effectiveness < 1) return "It's not very effective...";
    return '';
  };

  const getColor = () => {
    if (effectiveness > 1) return 'text-green-500';
    if (effectiveness < 1) return 'text-gray-500';
    return 'text-white';
  };

  return (
    <div className={`text-center text-xl font-bold ${getColor()} animate-pulse`}>
      {getMessage()}
    </div>
  );
}

interface CaptureAnimationProps {
  success: boolean;
  onComplete: () => void;
}

export function CaptureAnimation({ success, onComplete }: CaptureAnimationProps) {
  const [stage, setStage] = useState<'throwing' | 'shaking' | 'result'>('throwing');

  useEffect(() => {
    const throwTimer = setTimeout(() => setStage('shaking'), 500);
    const shakeTimer = setTimeout(() => setStage('result'), 2000);
    const completeTimer = setTimeout(onComplete, 3000);

    return () => {
      clearTimeout(throwTimer);
      clearTimeout(shakeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="text-center">
        {stage === 'throwing' && (
          <div className="text-8xl animate-bounce">🎯</div>
        )}
        {stage === 'shaking' && (
          <div className="text-8xl animate-shake">⚪</div>
        )}
        {stage === 'result' && (
          <div className={`text-6xl ${success ? 'animate-bounce' : 'animate-ping'}`}>
            {success ? '✅ Captured!' : '❌ Failed!'}
          </div>
        )}
      </div>
    </div>
  );
}
