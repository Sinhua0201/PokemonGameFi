'use client';

import { useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';
import { PACKAGE_ID, MARKETPLACE_ID, RPC_URL } from '@/config/constants';

export default function TestBuyPage() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // The actual listing from marketplace
  const TEST_LISTING = {
    nftId: '0x4dedd2e170e11782fa9eb176299978997f4cf7f25c201a017c0ed77abf49ee5c',
    price: 0.01, // OCT
    nftType: 'egg',
  };

  const testBuy = async () => {
    if (!account?.address) {
      setResult({ error: 'Wallet not connected' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      console.log('🔧 Starting buy test...');
      console.log('Account:', account.address);
      console.log('NFT ID:', TEST_LISTING.nftId);
      console.log('Price:', TEST_LISTING.price);

      const client = new SuiClient({ url: RPC_URL });

      // Get OCT coins
      const octCoins = await client.getCoins({
        owner: account.address,
        coinType: '0x2::oct::OCT',
      });

      console.log('OCT coins found:', octCoins.data.length);

      if (!octCoins.data || octCoins.data.length === 0) {
        throw new Error('No OCT coins found');
      }

      const totalBalance = octCoins.data.reduce(
        (sum, coin) => sum + BigInt(coin.balance),
        BigInt(0)
      );

      console.log('Total OCT balance:', Number(totalBalance) / 1_000_000_000);

      const priceInMist = Math.floor(TEST_LISTING.price * 1_000_000_000);
      console.log('Price in MIST:', priceInMist);

      if (totalBalance < BigInt(priceInMist)) {
        throw new Error(`Insufficient balance. Have: ${Number(totalBalance) / 1_000_000_000}, Need: ${TEST_LISTING.price}`);
      }

      // Build transaction
      const tx = new Transaction();

      // Split coins
      const firstCoin = octCoins.data[0];
      const [paymentCoin] = tx.splitCoins(
        tx.object(firstCoin.coinObjectId),
        [tx.pure.u64(priceInMist)]
      );

      console.log('Building transaction...');

      // Call buy_egg
      tx.moveCall({
        target: `${PACKAGE_ID}::marketplace::buy_egg`,
        typeArguments: ['0x2::oct::OCT'],
        arguments: [
          tx.object(MARKETPLACE_ID),
          tx.pure.id(TEST_LISTING.nftId),
          paymentCoin,
        ],
      });

      console.log('Transaction built, requesting signature...');

      // Execute
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log('✅ Success!', result);
            setResult({ success: true, result });
            setLoading(false);
          },
          onError: (error) => {
            console.error('❌ Error:', error);
            setResult({ error: error.message || 'Transaction failed' });
            setLoading(false);
          },
        }
      );

    } catch (error: any) {
      console.error('❌ Error:', error);
      setResult({ error: error.message });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">🧪 Test Buy Function</h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Test Listing</h2>
          <div className="space-y-2 font-mono text-sm">
            <p><strong>NFT ID:</strong> {TEST_LISTING.nftId}</p>
            <p><strong>Type:</strong> {TEST_LISTING.nftType}</p>
            <p><strong>Price:</strong> {TEST_LISTING.price} OCT</p>
            <p><strong>Your Address:</strong> {account?.address || 'Not connected'}</p>
          </div>
        </div>

        <button
          onClick={testBuy}
          disabled={loading || !account}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        >
          {loading ? 'Processing...' : 'Test Buy'}
        </button>

        {result && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">
              {result.success ? '✅ Success' : '❌ Error'}
            </h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6 bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
          <p className="text-yellow-800 text-sm font-semibold">
            💡 <strong>Tip:</strong> Open browser console (F12) to see detailed logs
          </p>
        </div>
      </div>
    </div>
  );
}
