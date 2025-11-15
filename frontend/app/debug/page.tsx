'use client';

import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, NETWORK } from '@/config/constants';
import { useState } from 'react';

export default function DebugPage() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const runSimpleTest = async () => {
    setIsLoading(true);
    setTestResult('Testing...');

    try {
      console.log('🔧 Starting simple transaction test...');
      
      const tx = new Transaction();
      
      // Simple transfer to self (should always work if wallet is connected)
      tx.transferObjects(
        [tx.gas],
        account?.address!
      );

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log('✅ Test transaction successful:', result);
            setTestResult('✅ Transaction successful! Your wallet is working correctly.');
            setIsLoading(false);
          },
          onError: (err) => {
            console.error('❌ Test transaction failed:', err);
            setTestResult(`❌ Transaction failed: ${err.message || JSON.stringify(err)}`);
            setIsLoading(false);
          },
        }
      );
    } catch (err: any) {
      console.error('❌ Error preparing test transaction:', err);
      setTestResult(`❌ Error: ${err.message || JSON.stringify(err)}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">🔧 Debug & Diagnostics</h1>

        {/* Configuration Status */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">📋 Configuration Status</h2>
          
          <div className="space-y-3 text-white">
            <div className="flex items-center justify-between p-3 bg-black/20 rounded">
              <span className="font-semibold">Package ID:</span>
              <span className={`font-mono text-sm ${PACKAGE_ID ? 'text-green-400' : 'text-red-400'}`}>
                {PACKAGE_ID || '❌ Not configured'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-black/20 rounded">
              <span className="font-semibold">Network:</span>
              <span className="font-mono text-sm text-green-400">{NETWORK}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-black/20 rounded">
              <span className="font-semibold">Wallet Connected:</span>
              <span className={account ? 'text-green-400' : 'text-red-400'}>
                {account ? '✅ Yes' : '❌ No'}
              </span>
            </div>

            {account && (
              <div className="flex items-center justify-between p-3 bg-black/20 rounded">
                <span className="font-semibold">Wallet Address:</span>
                <span className="font-mono text-xs text-green-400">
                  {account.address.slice(0, 8)}...{account.address.slice(-6)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Environment Variables */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">🔐 Environment Variables</h2>
          
          <div className="space-y-2 text-white font-mono text-sm">
            <div className="p-3 bg-black/20 rounded">
              <div className="text-gray-300 mb-1">NEXT_PUBLIC_ONECHAIN_PACKAGE_ID:</div>
              <div className={PACKAGE_ID ? 'text-green-400' : 'text-red-400'}>
                {PACKAGE_ID || '❌ Not set'}
              </div>
            </div>

            <div className="p-3 bg-black/20 rounded">
              <div className="text-gray-300 mb-1">NEXT_PUBLIC_ONECHAIN_NETWORK:</div>
              <div className="text-green-400">{NETWORK}</div>
            </div>
          </div>
        </div>

        {/* Transaction Test */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">🧪 Transaction Test</h2>
          
          <p className="text-white/80 mb-4">
            Test if your wallet can sign and execute transactions. This will attempt a simple
            self-transfer transaction.
          </p>

          <button
            onClick={runSimpleTest}
            disabled={!account || isLoading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 
                     text-white font-bold rounded-lg transition-colors"
          >
            {isLoading ? '⏳ Testing...' : '🧪 Run Simple Test'}
          </button>

          {testResult && (
            <div className={`mt-4 p-4 rounded-lg ${
              testResult.includes('✅') ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
            }`}>
              <pre className="whitespace-pre-wrap font-mono text-sm">{testResult}</pre>
            </div>
          )}
        </div>

        {/* Troubleshooting Checklist */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">✅ Troubleshooting Checklist</h2>
          
          <div className="space-y-3 text-white">
            <label className="flex items-center space-x-3 p-3 bg-black/20 rounded cursor-pointer hover:bg-black/30">
              <input type="checkbox" className="w-5 h-5" />
              <span>OneWallet extension is installed and unlocked</span>
            </label>

            <label className="flex items-center space-x-3 p-3 bg-black/20 rounded cursor-pointer hover:bg-black/30">
              <input type="checkbox" className="w-5 h-5" />
              <span>OneWallet is connected to this dApp</span>
            </label>

            <label className="flex items-center space-x-3 p-3 bg-black/20 rounded cursor-pointer hover:bg-black/30">
              <input type="checkbox" className="w-5 h-5" />
              <span>OneWallet network is set to <strong>Testnet</strong></span>
            </label>

            <label className="flex items-center space-x-3 p-3 bg-black/20 rounded cursor-pointer hover:bg-black/30">
              <input type="checkbox" className="w-5 h-5" />
              <span>Wallet has sufficient SUI balance (at least 0.5 SUI)</span>
            </label>

            <label className="flex items-center space-x-3 p-3 bg-black/20 rounded cursor-pointer hover:bg-black/30">
              <input type="checkbox" className="w-5 h-5" />
              <span>Package ID is configured in .env.local</span>
            </label>

            <label className="flex items-center space-x-3 p-3 bg-black/20 rounded cursor-pointer hover:bg-black/30">
              <input type="checkbox" className="w-5 h-5" />
              <span>Frontend dev server has been restarted after .env changes</span>
            </label>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mt-6">
          <h2 className="text-2xl font-bold text-white mb-4">🔗 Quick Links</h2>
          
          <div className="space-y-2">
            <a
              href="https://faucet.sui.io"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              💰 Get Testnet SUI (Faucet)
            </a>

            <a
              href={`https://suiscan.xyz/testnet/object/${PACKAGE_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              🔍 View Contract on Explorer
            </a>

            <a
              href="/TRANSACTION_ERROR_DEBUG.md"
              target="_blank"
              className="block p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              📖 Full Debug Guide
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
