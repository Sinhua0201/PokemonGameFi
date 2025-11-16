'use client';

import { useCurrentAccount } from '@mysten/dapp-kit';
import { usePlayerPokemon } from '@/hooks/usePlayerPokemon';
import { WalletGuard } from '@/components/WalletGuard';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function DebugPokemonPage() {
  const account = useCurrentAccount();
  const { pokemon, loading, error } = usePlayerPokemon(account?.address);
  const [rawData, setRawData] = useState<any[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!account?.address) return;

    const fetchRawData = async () => {
      try {
        const pokemonCollection = collection(db, 'pokemon');
        const q = query(pokemonCollection, where('owner', '==', account.address));
        const querySnapshot = await getDocs(q);
        
        const data: any[] = [];
        querySnapshot.forEach((doc) => {
          data.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setRawData(data);
        setFetchError(null);
      } catch (err: any) {
        console.error('Error fetching raw data:', err);
        setFetchError(err.message);
      }
    };

    fetchRawData();
  }, [account?.address]);

  return (
    <WalletGuard>
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">🔍 Pokemon 数据调试</h1>

          {/* Wallet Info */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">钱包信息</h2>
            <div className="space-y-2">
              <p><strong>地址:</strong> {account?.address || '未连接'}</p>
              <p><strong>状态:</strong> {account ? '✅ 已连接' : '❌ 未连接'}</p>
            </div>
          </div>

          {/* Hook Data */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">usePlayerPokemon Hook 数据</h2>
            <div className="space-y-2">
              <p><strong>加载中:</strong> {loading ? '是' : '否'}</p>
              <p><strong>Pokemon 数量:</strong> {pokemon.length}</p>
              <p><strong>错误:</strong> {error ? error.message : '无'}</p>
            </div>
            
            {pokemon.length > 0 && (
              <div className="mt-4">
                <h3 className="font-bold mb-2">解析后的 Pokemon:</h3>
                <pre className="bg-gray-900 p-4 rounded overflow-auto text-sm">
                  {JSON.stringify(pokemon, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Raw Firestore Data */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Firestore 原始数据</h2>
            <div className="space-y-2">
              <p><strong>文档数量:</strong> {rawData.length}</p>
              <p><strong>获取错误:</strong> {fetchError || '无'}</p>
            </div>
            
            {rawData.length > 0 ? (
              <div className="mt-4">
                <h3 className="font-bold mb-2">原始数据:</h3>
                <pre className="bg-gray-900 p-4 rounded overflow-auto text-sm max-h-96">
                  {JSON.stringify(rawData, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="mt-4 p-4 bg-yellow-900/30 border border-yellow-500 rounded">
                <p className="text-yellow-300">
                  ⚠️ Firestore 中没有找到属于你的 Pokemon
                </p>
                <p className="text-sm text-yellow-200 mt-2">
                  可能原因：
                </p>
                <ul className="list-disc list-inside text-sm text-yellow-200 mt-1">
                  <li>还没有 mint 过 Pokemon</li>
                  <li>owner 地址不匹配</li>
                  <li>Firestore 保存失败</li>
                </ul>
              </div>
            )}
          </div>

          {/* All Pokemon in Database */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">数据库中所有 Pokemon (调试用)</h2>
            <AllPokemonDebug />
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-4">
            <a
              href="/start-game"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
            >
              去获取 Starter Pokemon
            </a>
            <a
              href="/profile"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold"
            >
              返回 Profile
            </a>
          </div>
        </div>
      </div>
    </WalletGuard>
  );
}

function AllPokemonDebug() {
  const [allPokemon, setAllPokemon] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const pokemonCollection = collection(db, 'pokemon');
        const querySnapshot = await getDocs(pokemonCollection);
        
        const data: any[] = [];
        querySnapshot.forEach((doc) => {
          data.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setAllPokemon(data);
      } catch (err) {
        console.error('Error fetching all pokemon:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (loading) {
    return <p>加载中...</p>;
  }

  return (
    <div>
      <p className="mb-2"><strong>总数:</strong> {allPokemon.length}</p>
      {allPokemon.length > 0 ? (
        <div className="space-y-2">
          {allPokemon.map((poke, index) => (
            <div key={poke.id} className="bg-gray-900 p-3 rounded text-sm">
              <p><strong>#{index + 1}</strong></p>
              <p><strong>ID:</strong> {poke.id}</p>
              <p><strong>Name:</strong> {poke.name}</p>
              <p><strong>Owner:</strong> {poke.owner}</p>
              <p><strong>Species ID:</strong> {poke.species_id || poke.speciesId}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-yellow-300">数据库中没有任何 Pokemon</p>
      )}
    </div>
  );
}
