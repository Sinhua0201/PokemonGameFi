'use client';

import { useState, useEffect } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { 
  checkEncounterCooldown, 
  updateEncounterCooldown,
  getGameState,
  initializeGameState 
} from '@/lib/firestore';
import { ENCOUNTER_COOLDOWN_MINUTES } from '@/config/constants';

/**
 * Hook to manage encounter cooldown
 */
export function useEncounter() {
  const account = useCurrentAccount();
  const [canEncounter, setCanEncounter] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!account?.address) {
      setIsChecking(false);
      return;
    }

    checkCooldown();
    
    // Check cooldown every second
    const interval = setInterval(checkCooldown, 1000);
    
    return () => clearInterval(interval);
  }, [account?.address]);

  const checkCooldown = async () => {
    if (!account?.address) return;

    try {
      // Ensure game state exists
      let gameState = await getGameState(account.address);
      if (!gameState) {
        await initializeGameState(account.address);
        gameState = await getGameState(account.address);
      }

      const canEncounterNow = await checkEncounterCooldown(account.address);
      setCanEncounter(canEncounterNow);

      if (!canEncounterNow && gameState?.encounterCooldownUntil) {
        const now = new Date();
        const cooldownEnd = gameState.encounterCooldownUntil.toDate();
        const remaining = Math.max(0, Math.floor((cooldownEnd.getTime() - now.getTime()) / 1000));
        setCooldownRemaining(remaining);
      } else {
        setCooldownRemaining(0);
      }

      setIsChecking(false);
    } catch (error) {
      console.error('Error checking encounter cooldown:', error);
      setIsChecking(false);
    }
  };

  const startEncounter = async () => {
    if (!account?.address || !canEncounter) return false;

    try {
      await updateEncounterCooldown(account.address);
      setCanEncounter(false);
      setCooldownRemaining(ENCOUNTER_COOLDOWN_MINUTES * 60);
      return true;
    } catch (error) {
      console.error('Error starting encounter:', error);
      return false;
    }
  };

  const formatCooldown = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    canEncounter,
    cooldownRemaining,
    isChecking,
    startEncounter,
    formatCooldown,
    refreshCooldown: checkCooldown,
  };
}
