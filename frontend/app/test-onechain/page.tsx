'use client';

import { useCurrentAccount } from '@mysten/dapp-kit';
import { useState } from 'react';
import { PACKAGE_ID, RPC_URL, GAME_STATE_ID, MARKETPLACE_ID } from '@/config/constants';
import { usePlayerPokemonNFT } from '@/hooks/usePlayerPokemonNFT';

export default function TestOneChainPage() {
  const account = useCurrentAccount();
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { pokemon, loading: pokemonLoading, error: pokemonError } = usePlayerPokemonNFT();

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const { SuiClient } = await import('@mysten/sui/client');
      const client = new SuiClient({ url: RPC_URL });
      
      // Test 1: Get chain identifier
      const chainId = await client.getChainIdentifier();
      
      // Test 2: Get latest checkpoint
      const checkpoint = await client.getLatestCheckpointSequenceNumber();
      
      // Test 3: Get package info
      let packageInfo = null;
      if (PACKAGE_ID) {
        try {
          packageInfo = await client.getObject({
            id: PACKAGE_ID,
            options: { showContent: true }
          });
        } catch (e) {
          packageInfo = { error: (e as Error).message };
        }
      }
      
      setTestResult({
        success: true,
        chainId,
        checkpoint,
        packageInfo,
        config: {
          rpcUrl: RPC_URL,
          packageId: PACKAGE_ID,
          gameStateId: GAME_STATE_ID,
          marketplaceId: MARKETPLACE_ID,
        }
      });
    } catch (error) {
      setTestResult({
        success: false,
        error: (error as Error).message,
        config: {
          rpcUrl: RPC_URL,
          packageId: PACKAGE_ID,
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">OneChain 连接测试</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">钱包状态</h2>
        {account ? (
          <div>
            <p className="text-green-600">✅ 钱包已连接</p>
            <p className="font-mono text-sm mt-2">{account.address}</p>
          </div>
        ) : (
          <p className="text-red-600">❌ 钱包未连接</p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">配置信息</h2>
        <div className="space-y-2 font-mono text-sm">
          <div>
            <span className="font-semibold">RPC URL:</span> {RPC_URL}
          </div>
          <div>
            <span className="font-semibold">Package ID:</span> {PACKAGE_ID || '未配置'}
          </div>
          <div>
            <span className="font-semibold">GameState ID:</span> {GAME_STATE_ID || '未配置'}
          </div>
          <div>
            <span className="font-semibold">Marketplace ID:</span> {MARKETPLACE_ID || '未配置'}
          </div>
        </div>
      </div>

      <button
        onClick={testConnection}
        disabled={isLoading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isLoading ? '测试中...' : '测试 RPC 连接'}
      </button>

      {testResult && (
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">测试结果</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Pokemon NFT 查询</h2>
        {pokemonLoading ? (
          <p className="text-gray-600">加载中...</p>
        ) : pokemonError ? (
          <div>
            <p className="text-red-600">❌ 查询失败</p>
            <pre className="bg-red-50 p-4 rounded overflow-auto text-sm mt-2">
              {JSON.stringify(pokemonError, null, 2)}
            </pre>
          </div>
        ) : (
          <div>
            <p className="mb-2">
              {pokemon.length > 0 ? (
                <span className="text-green-600">✅ 找到 {pokemon.length} 个 Pokemon</span>
              ) : (
                <span className="text-yellow-600">⚠️ 没有找到 Pokemon NFT</span>
              )}
            </p>
            {pokemon.length > 0 && (
              <div className="space-y-4 mt-4">
                {pokemon.map((p) => (
                  <div key={p.id} className="border rounded p-4">
                    <div className="flex items-center gap-4">
                      <img src={p.sprite} alt={p.name} className="w-16 h-16" />
                      <div>
                        <p className="font-semibold">{p.name}</p>
                        <p className="text-sm text-gray-600">Level {p.level}</p>
                        <p className="text-xs font-mono text-gray-400">{p.id}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <p className="text-sm font-semibold mb-2">查询参数:</p>
              <pre className="text-xs">
{`Filter: ${PACKAGE_ID}::pokemon::Pokemon
Owner: ${account?.address || 'Not connected'}`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
