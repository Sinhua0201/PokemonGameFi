'use client';

import { useEffect, useRef } from 'react';
import { BattleEvent } from '@/store/battleStore';

interface BattleLogProps {
  events: BattleEvent[];
  commentary: string[];
}

export function BattleLog({ events, commentary }: BattleLogProps) {
  const logRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Auto-scroll to bottom when new events are added
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [events, commentary]);
  
  const getEffectivenessText = (effectiveness: number) => {
    if (effectiveness > 1) return 'Super effective!';
    if (effectiveness < 1) return 'Not very effective...';
    return '';
  };
  
  return (
    <div className="bg-gray-800 text-white rounded-lg p-4 h-64 overflow-y-auto" ref={logRef}>
      <h3 className="text-lg font-bold mb-3 text-yellow-400">Battle Log</h3>
      
      <div className="space-y-2">
        {events.map((event, index) => (
          <div key={index} className="border-l-2 border-blue-500 pl-3 py-1">
            <div className="text-sm">
              <span className="font-semibold text-blue-300">Turn {event.turn}:</span>{' '}
              <span className="text-gray-300">{event.attacker}</span> used{' '}
              <span className="font-bold text-yellow-300">{event.move}</span>!
            </div>
            
            <div className="text-xs text-gray-400 mt-1">
              Dealt <span className="font-bold text-red-400">{event.damage}</span> damage
              {event.critical && (
                <span className="ml-2 text-orange-400 font-bold">CRITICAL HIT!</span>
              )}
            </div>
            
            {event.effectiveness !== 1 && (
              <div className="text-xs text-purple-300 mt-1">
                {getEffectivenessText(event.effectiveness)}
              </div>
            )}
            
            {event.commentary && (
              <div className="text-xs text-green-300 italic mt-1">
                💬 {event.commentary}
              </div>
            )}
          </div>
        ))}
        
        {commentary.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-700">
            <h4 className="text-sm font-bold text-green-400 mb-2">AI Commentary</h4>
            {commentary.slice(-3).map((comment, index) => (
              <div key={index} className="text-xs text-gray-300 italic mb-1">
                💬 {comment}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {events.length === 0 && commentary.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          Battle log will appear here...
        </div>
      )}
    </div>
  );
}
