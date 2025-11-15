'use client';

import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { useEffect, useState } from 'react';

export default function TestConnectionPage() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const [chainId, setChainId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setError('');
    try {
      const id = await client.getChainIdentifier();
      setChainId(id);
      console.log('✅ OneChain 连接成功！Chain ID:', id);
    } catch (err: any) {
      setError(err.message || '连接失败');
      console.error('❌ OneChain 连接失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">OneChain 连接测试</h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">RPC 连接状态</h2>
          
          {loading && (
            <div className="text-blue-600">正在测试连接...</div>
          )}

          {chainId && (
            <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
              <div className="text-green-800 font-semibold">✅ 连接成功！</div>
              <div className="text-sm text-green-600 mt-2">
                Chain ID: <code className="bg-green-100 px-2 py-1 rounded">{chainId}</code>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
              <div className="text-red-800 font-semibold">❌ 连接失败</div>
              <div className="text-sm text-red-600 mt-2">{error}</div>
            </div>
          )}

          <button
            onClick={testConnection}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            重新测试连接
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">钱包连接状态</h2>
          
          {account ? (
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <div className="text-green-800 font-semibold">✅ 钱包已连接</div>
              <div className="text-sm text-green-600 mt-2">
                地址: <code className="bg-green-100 px-2 py-1 rounded text-xs break-all">
                  {account.address}
                </code>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <div className="text-yellow-800 font-semibold">⚠️ 钱包未连接</div>
              <div className="text-sm text-yellow-600 mt-2">
                请点击右上角的 "Connect Wallet" 按钮连接钱包
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">配置信息</h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-semibold">RPC URL:</span>{' '}
              <code className="bg-gray-100 px-2 py-1 rounded">
                https://rpc-testnet.onelabs.cc
              </code>
            </div>
            <div>
              <span className="font-semibold">Network:</span>{' '}
              <code className="bg-gray-100 px-2 py-1 rounded">onechain</code>
            </div>
            <div>
              <span className="font-semibold">Expected Chain ID:</span>{' '}
              <code className="bg-gray-100 px-2 py-1 rounded">1bd5c965</code>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            返回首页
          </a>
        </div>
      </div>
    </div>
  );
}
