'use client';

import { useState, useEffect } from 'react';
import { BattlePokemon } from '@/store/battleStore';
import { HealthBar } from './HealthBar';
import Image from 'next/image';

interface BattleFieldProps {
  playerPokemon: BattlePokemon;
  opponentPokemon: BattlePokemon;
  isAnimating?: boolean;
  lastDamage?: { target: 'player' | 'opponent'; amount: number } | null;
}

export function BattleField({
  playerPokemon,
  opponentPokemon,
  isAnimating = false,
  lastDamage = null,
}: BattleFieldProps) {
  const [playerShake, setPlayerShake] = useState(false);
  const [opponentShake, setOpponentShake] = useState(false);
  const [showPlayerDamage, setShowPlayerDamage] = useState(false);
  const [showOpponentDamage, setShowOpponentDamage] = useState(false);
  
  useEffect(() => {
    if (lastDamage) {
      if (lastDamage.target === 'player') {
        setPlayerShake(true);
        setShowPlayerDamage(true);
        setTimeout(() => {
          setPlayerShake(false);
          setShowPlayerDamage(false);
        }, 1000);
      } else {
        setOpponentShake(true);
        setShowOpponentDamage(true);
        setTimeout(() => {
          setOpponentShake(false);
          setShowOpponentDamage(false);
        }, 1000);
      }
    }
  }, [lastDamage]);
  
  return (
    <div className="relative w-full h-96 bg-gradient-to-b from-blue-300 to-green-200 rounded-lg overflow-hidden shadow-xl">
      {/* Background */}
      <div className="absolute inset-0 bg-[url('/battle-bg.png')] bg-cover bg-center opacity-30" />
      
      {/* Opponent Pokémon (top right) */}
      <div className="absolute top-8 right-12">
        <div className="relative">
          {/* Opponent Pokémon sprite */}
          <div className={`transition-transform duration-200 ${opponentShake ? 'animate-shake' : ''}`}>
            <div className="relative w-32 h-32">
              <Image
                src={opponentPokemon.sprite}
                alt={opponentPokemon.name}
                fill
                className="object-contain pixelated"
                unoptimized
              />
            </div>
          </div>
          
          {/* Damage indicator */}
          {showOpponentDamage && lastDamage?.target === 'opponent' && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 animate-float-up">
              <span className="text-2xl font-bold text-red-600 drop-shadow-lg">
                -{lastDamage.amount}
              </span>
            </div>
          )}
        </div>
        
        {/* Opponent HP bar */}
        <div className="mt-2 w-64">
          <HealthBar
            current={opponentPokemon.currentHp}
            max={opponentPokemon.maxHp}
            name={opponentPokemon.name}
            level={opponentPokemon.level}
          />
        </div>
      </div>
      
      {/* Player Pokémon (bottom left) */}
      <div className="absolute bottom-8 left-12">
        <div className="relative">
          {/* Player Pokémon sprite */}
          <div className={`transition-transform duration-200 ${playerShake ? 'animate-shake' : ''}`}>
            <div className="relative w-40 h-40">
              <Image
                src={playerPokemon.backSprite || playerPokemon.sprite}
                alt={playerPokemon.name}
                fill
                className="object-contain pixelated"
                unoptimized
              />
            </div>
          </div>
          
          {/* Damage indicator */}
          {showPlayerDamage && lastDamage?.target === 'player' && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 animate-float-up">
              <span className="text-2xl font-bold text-red-600 drop-shadow-lg">
                -{lastDamage.amount}
              </span>
            </div>
          )}
        </div>
        
        {/* Player HP bar */}
        <div className="mt-2 w-64">
          <HealthBar
            current={playerPokemon.currentHp}
            max={playerPokemon.maxHp}
            name={playerPokemon.name}
            level={playerPokemon.level}
          />
        </div>
      </div>
      
      {/* Battle animation overlay */}
      {isAnimating && (
        <div className="absolute inset-0 bg-white opacity-20 animate-pulse" />
      )}
    </div>
  );
}
