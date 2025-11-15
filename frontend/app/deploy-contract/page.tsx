'use client';

import { useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { toast } from 'sonner';

export default function DeployContractPage() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [deploying, setDeploying] = useState(false);
  const [packageId, setPackageId] = useState('');

  const deployContract = async () => {
    if (!account) {
      toast.error('请先连接钱包');
      return;
    }

    setDeploying(true);
    toast.loading('正在部署合约...', { id: 'deploy' });

    try {
      // 注意：这个方法需要合约的编译字节码
      // 由于浏览器限制，我们需要使用 CLI 部署
      toast.error('浏览器部署需要合约字节码，请使用 CLI 部署', { id: 'deploy' });
      
    } catch (error: any) {
      console.error('部署失败:', error);
      toast.error(`部署失败: ${error.message}`, { id: 'deploy' });
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">部署合约到 OneChain</h1>

        {!account ? (
          <div className="bg-yellow-900/50 border border-yellow-600 rounded-lg p-6">
            <p className="text-yellow-200">请先连接 OneWallet</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">钱包信息</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-400">地址:</span>
                  <code className="ml-2 text-green-400 break-all">{account.address}</code>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/50 border border-blue-600 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">⚠️ 重要提示</h2>
              <div className="text-blue-200 space-y-2">
                <p>由于浏览器限制，合约部署需要使用命令行工具。</p>
                <p className="font-semibold mt-4">请按照以下步骤操作：</p>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">部署步骤</h2>
              <div className="space-y-4 text-gray-300">
                <div className="bg-gray-900 p-4 rounded">
                  <p className="font-semibold text-white mb-2">1. 使用 OneWallet Faucet 获取测试币</p>
                  <p className="text-sm">在 OneWallet 中点击 "Faucet" 按钮获取测试币</p>
                </div>

                <div className="bg-gray-900 p-4 rounded">
                  <p className="font-semibold text-white mb-2">2. 在 PowerShell 中运行</p>
                  <pre className="bg-black p-3 rounded mt-2 overflow-x-auto text-xs">
                    <code className="text-green-400">
{`cd contracts/pokemon_nft
sui client publish --gas-budget 500000000`}
                    </code>
                  </pre>
                </div>

                <div className="bg-gray-900 p-4 rounded">
                  <p className="font-semibold text-white mb-2">3. 复制 Package ID</p>
                  <p className="text-sm">部署成功后，从输出中复制 Package ID</p>
                </div>

                <div className="bg-gray-900 p-4 rounded">
                  <p className="font-semibold text-white mb-2">4. 更新环境变量</p>
                  <p className="text-sm mb-2">编辑 <code className="bg-gray-800 px-2 py-1 rounded">frontend/.env.local</code></p>
                  <pre className="bg-black p-3 rounded mt-2 overflow-x-auto text-xs">
                    <code className="text-green-400">
{`NEXT_PUBLIC_ONECHAIN_PACKAGE_ID=你的_PACKAGE_ID`}
                    </code>
                  </pre>
                </div>
              </div>
            </div>

            {packageId && (
              <div className="bg-green-900/50 border border-green-600 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">✅ 部署成功！</h2>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-300">Package ID:</span>
                    <code className="ml-2 text-green-400 break-all">{packageId}</code>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
