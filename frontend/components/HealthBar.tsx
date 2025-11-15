'use client';

import { useEffect, useState } from 'react';

interface HealthBarProps {
  current: number;
  max: number;
  name: string;
  level: number;
  animated?: boolean;
}

export function HealthBar({ current, max, name, level, animated = true }: HealthBarProps) {
  const [displayHp, setDisplayHp] = useState(current);
  
  useEffect(() => {
    if (animated) {
      // Animate HP change
      const duration = 500; // ms
      const steps = 20;
      const stepDuration = duration / steps;
      const hpDiff = current - displayHp;
      const stepSize = hpDiff / steps;
      
      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          setDisplayHp(current);
          clearInterval(interval);
        } else {
          setDisplayHp((prev) => prev + stepSize);
        }
      }, stepDuration);
      
      return () => clearInterval(interval);
    } else {
      setDisplayHp(current);
    }
  }, [current, animated]);
  
  const percentage = Math.max(0, Math.min(100, (displayHp / max) * 100));
  
  // Color based on HP percentage
  const getColor = () => {
    if (percentage > 50) return 'bg-green-500';
    if (percentage > 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="font-bold text-lg">{name}</span>
        <span className="text-sm text-gray-600">Lv. {level}</span>
      </div>
      
      <div className="relative w-full h-6 bg-gray-300 rounded-full overflow-hidden border-2 border-gray-400">
        <div
          className={`h-full ${getColor()} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white drop-shadow-md">
            {Math.round(displayHp)} / {max}
          </span>
        </div>
      </div>
    </div>
  );
}
