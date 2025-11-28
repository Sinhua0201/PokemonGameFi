'use client';

import { useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { SuiClient } from '@mysten/sui/client';
import { MARKETPLACE_ID, PACKAGE_ID, RPC_URL } from '@/config/constants';

export default function TestMarketplacePage() {
  const account = useCurrentAccount();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkMarketplace = async () => {
    setLoading(true);
    try {
      const client = new SuiClient({ url: RPC_URL });

      // 1. Check marketplace object
      const marketplace = await client.getObject({
        id: MARKETPLACE_ID,
        options: {
          showContent: true,
          showType: true,
        },
      });

      // 2. Check dynamic fields
      const dynamicFields = await client.getDynamicFields({
        parentId: MARKETPLACE_ID,
      });

      // 3. Check OCT balance
      let octBalance = 0;
      if (account?.address) {
        const coins = await client.getCoins({
          owner: account.address,
          coinType: '0x2::oct::OCT',
        });
        octBalance = coins.data.reduce((sum, coin) => sum + parseInt(coin.balance), 0);
      }

      setResult({
        marketplace: marketplace.data,
        dynamicFields: dynamicFields.data,
        octBalance: octBalance / 1_000_000_000,
        account: account?.address,
      });
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">🔍 Marketplace Diagnostics</h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Configuration</h2>
          <div className="space-y-2 font-mono text-sm">
            <p><strong>Package ID:</strong> {PACKAGE_ID}</p>
            <p><strong>Marketplace ID:</strong> {MARKETPLACE_ID}</p>
            <p><strong>RPC URL:</strong> {RPC_URL}</p>
            <p><strong>Your Address:</strong> {account?.address || 'Not connected'}</p>
          </div>
        </div>

        <button
          onClick={checkMarketplace}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg mb-6 disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Check Marketplace Status'}
        </button>

        {result && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Results</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-xs">
              {JSON.stringify(result, null, 2)}
            </pre>

            {result.dynamicFields && (
              <div className="mt-4">
                <h3 className="text-xl font-bold mb-2">Active Listings</h3>
                <p className="text-lg">
                  Total: <strong>{result.dynamicFields.length}</strong>
                </p>
              </div>
            )}

            {result.octBalance !== undefined && (
              <div className="mt-4">
                <h3 className="text-xl font-bold mb-2">Your OCT Balance</h3>
                <p className="text-lg">
                  <strong>{result.octBalance.toFixed(3)} OCT</strong>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
