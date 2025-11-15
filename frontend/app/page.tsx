'use client';

import { WalletGuard } from '@/components/WalletGuard';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LoadingScreen } from '@/components/LoadingSpinner';
import { ResponsiveContainer, Card, Grid } from '@/components/ResponsiveContainer';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function Home() {
  const router = useRouter();
  const account = useCurrentAccount();
  const [checkingProfile, setCheckingProfile] = useState(true);

  // 检查用户是否已创建角色
  useEffect(() => {
    const checkProfile = async () => {
      if (account?.address) {
        try {
          const profileRef = doc(db, 'trainers', account.address);
          const profileSnap = await getDoc(profileRef);
          
          if (!profileSnap.exists()) {
            // 没有角色，跳转到创建角色页面
            router.push('/start-game');
            return;
          }
        } catch (error) {
          console.error('Error checking profile:', error);
        }
      }
      setCheckingProfile(false);
    };

    checkProfile();
  }, [account, router]);

  if (checkingProfile && account) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-gray-800 dark:to-black">
      <ResponsiveContainer maxWidth="2xl" className="py-8 sm:py-12">
        <WalletGuard>
          <div className="text-center space-y-8 animate-fade-in">
            {/* Hero Section */}
            <div className="space-y-4 mb-12">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white animate-scale-in">
                Welcome to PokéChain Battles!
              </h2>
              <p className="text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto">
                Capture, train, and battle Pokémon as NFTs on the OneChain blockchain.
                Your adventure begins here!
              </p>
            </div>

            {/* Action Cards */}
            <Grid cols={3} gap={6} className="mt-12">
              <Link href="/starter" className="group animate-slide-in-left">
                <Card hover className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/30 hover:border-blue-500">
                  <div className="text-5xl mb-4 group-hover:animate-bounce-slow">🎁</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Get Starter</h3>
                  <p className="text-gray-300">
                    Receive your first Pokémon NFT to begin your journey
                  </p>
                </Card>
              </Link>

              <Link href="/encounter" className="group animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
                <Card hover className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/30 hover:border-green-500">
                  <div className="text-5xl mb-4 group-hover:animate-bounce-slow">🌿</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Wild Encounter</h3>
                  <p className="text-gray-300">
                    Explore and capture wild Pokémon in the wilderness
                  </p>
                </Card>
              </Link>

              <Link href="/battle?player=25&opponent=4" className="group animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
                <Card hover className="p-6 bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/30 hover:border-red-500">
                  <div className="text-5xl mb-4 group-hover:animate-bounce-slow">⚔️</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Battle</h3>
                  <p className="text-gray-300">
                    Challenge AI trainers and test your skills
                  </p>
                </Card>
              </Link>

              <Link href="/breeding" className="group animate-slide-in-right">
                <Card hover className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/30 hover:border-purple-500">
                  <div className="text-5xl mb-4 group-hover:animate-bounce-slow">🥚</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Breeding</h3>
                  <p className="text-gray-300">
                    Breed Pokémon and hatch eggs with unique traits
                  </p>
                </Card>
              </Link>

              <Link href="/marketplace" className="group animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
                <Card hover className="p-6 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-500/30 hover:border-yellow-500">
                  <div className="text-5xl mb-4 group-hover:animate-bounce-slow">🛒</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Marketplace</h3>
                  <p className="text-gray-300">
                    Trade Pokémon and Egg NFTs with other players
                  </p>
                </Card>
              </Link>

              <Link href="/profile" className="group animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
                <Card hover className="p-6 bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border-cyan-500/30 hover:border-cyan-500">
                  <div className="text-5xl mb-4 group-hover:animate-bounce-slow">👤</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Profile</h3>
                  <p className="text-gray-300">
                    View your collection and battle history
                  </p>
                </Card>
              </Link>
            </Grid>

            {/* Info Section */}
            <Card className="mt-16 p-6 sm:p-8 max-w-3xl mx-auto bg-white/5 backdrop-blur-sm border-white/10 animate-fade-in">
              <h3 className="text-2xl font-bold text-white mb-6">How It Works</h3>
              <div className="space-y-4 text-left text-gray-200">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🔗</span>
                  <div>
                    <strong className="text-white">Connect OneWallet:</strong>
                    <span className="text-gray-300"> Securely link your Sui-compatible wallet</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎮</span>
                  <div>
                    <strong className="text-white">Mint NFTs:</strong>
                    <span className="text-gray-300"> All Pokémon are true NFTs on OneChain blockchain</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <strong className="text-white">AI-Powered:</strong>
                    <span className="text-gray-300"> Battle commentary and quests generated by Gemini AI</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📈</span>
                  <div>
                    <strong className="text-white">Level Up:</strong>
                    <span className="text-gray-300"> Your Pokémon grow stronger through battles</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💎</span>
                  <div>
                    <strong className="text-white">Trade Freely:</strong>
                    <span className="text-gray-300"> Buy, sell, and trade on the decentralized marketplace</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </WalletGuard>
      </ResponsiveContainer>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-16 py-8 bg-black/20">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p className="text-sm sm:text-base">Built on OneChain • Powered by Gemini AI • Data from PokéAPI</p>
        </div>
      </footer>
    </div>
  );
}
