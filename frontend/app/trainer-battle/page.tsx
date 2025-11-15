'use client';

import { useState, useEffect } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useRouter } from 'next/navigation';
import { WalletGuard } from '@/components/WalletGuard';
import { usePlayerPokemon } from '@/hooks/usePlayerPokemon';
import { TrainerSelection } from '@/components/TrainerSelection';
import { TeamSelection } from '@/components/TeamSelection';
import { TrainerBattle } from '@/components/TrainerBattle';
import { toast } from 'sonner';

export default function TrainerBattlePage() {
  const account = useCurrentAccount();
  const router = useRouter();
  const { pokemon: playerPokemonList, loading } = usePlayerPokemon(account?.address);
  
  const [phase, setPhase] = useState<'select-team' | 'select-trainer' | 'battle'>('select-team');
  const [selectedTeam, setSelectedTeam] = useState<any[]>([]);
  const [trainer, setTrainer] = useState<any>(null);

  const handleTeamSelected = (team: any[]) => {
    if (team.length === 0) {
      toast.error('请至少选择 1 只 Pokemon！');
      return;
    }
    setSelectedTeam(team);
    setPhase('select-trainer');
  };

  const handleTrainerSelected = (selectedTrainer: any) => {
    setTrainer(selectedTrainer);
    setPhase('battle');
  };

  const handleBattleEnd = () => {
    setPhase('select-team');
    setSelectedTeam([]);
    setTrainer(null);
  };

  if (loading) {
    return (
      <WalletGuard>
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4" />
            <p className="text-white text-lg">加载中...</p>
          </div>
        </div>
      </WalletGuard>
    );
  }

  return (
    <WalletGuard>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {phase === 'select-team' && (
            <TeamSelection
              playerPokemon={playerPokemonList}
              onTeamSelected={handleTeamSelected}
              onBack={() => router.push('/')}
            />
          )}

          {phase === 'select-trainer' && (
            <TrainerSelection
              playerTeam={selectedTeam}
              onTrainerSelected={handleTrainerSelected}
              onBack={() => setPhase('select-team')}
            />
          )}

          {phase === 'battle' && trainer && (
            <TrainerBattle
              playerTeam={selectedTeam}
              trainer={trainer}
              onBattleEnd={handleBattleEnd}
            />
          )}
        </div>
      </div>
    </WalletGuard>
  );
}
