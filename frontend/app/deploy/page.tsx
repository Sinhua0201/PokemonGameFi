'use client'

import { useState } from 'react'
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { toast } from 'sonner'

export default function DeployPage() {
  const account = useCurrentAccount()
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction()
  const [deploying, setDeploying] = useState(false)
  const [result, setResult] = useState<any>(null)

  const deployContract = async () => {
    if (!account) {
      toast.error('请先连接钱包')
      return
    }

    setDeploying(true)
    toast.info('准备部署合约...')

    try {
      // 这里需要合约的编译后的字节码
      // 由于我们无法在浏览器中编译 Move 代码
      // 我们需要先用 CLI 编译，然后获取字节码
      
      toast.error('需要先用 CLI 编译合约')
      toast.info('请按照以下步骤操作：')
      
      setResult({
        message: '浏览器无法直接部署 Move 合约',
        steps: [
          '1. 在 OneWallet 中找到"导出私钥"功能',
          '2. 复制私钥',
          '3. 在终端运行: sui keytool import "私钥" ed25519',
          '4. 运行: sui client publish --gas-budget 100000000'
        ]
      })
      
    } catch (error: any) {
      console.error('Deploy error:', error)
      toast.error('部署失败: ' + error.message)
    } finally {
      setDeploying(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">部署合约到 OneChain</h1>
        
        {!account ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-white">
            <p className="text-xl">请先连接 OneWallet</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
              <h2 className="text-2xl font-bold mb-4">钱包信息</h2>
              <p className="mb-2">地址: {account.address}</p>
              <p className="text-sm text-gray-300">网络: OneChain Testnet</p>
            </div>

            <div className="bg-yellow-500/20 backdrop-blur-sm rounded-lg p-6 text-white">
              <h2 className="text-xl font-bold mb-4">⚠️ 重要提示</h2>
              <p className="mb-4">
                Move 合约需要在本地编译后才能部署。浏览器无法直接编译 Move 代码。
              </p>
              <p className="font-bold">请使用以下方法之一：</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
              <h2 className="text-xl font-bold mb-4">方法 1: 使用 CLI 部署（推荐）</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>在 OneWallet 中导出私钥（设置 → 安全 → 导出私钥）</li>
                <li>在终端运行: <code className="bg-black/30 px-2 py-1 rounded">sui keytool import "你的私钥" ed25519</code></li>
                <li>切换网络: <code className="bg-black/30 px-2 py-1 rounded">sui client switch --env onechain-testnet</code></li>
                <li>部署: <code className="bg-black/30 px-2 py-1 rounded">cd contracts/pokemon_nft && sui client publish --gas-budget 100000000</code></li>
              </ol>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
              <h2 className="text-xl font-bold mb-4">方法 2: 使用 OneBox 部署</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>访问 <a href="https://onebox-app.vercel.app/dashboard" target="_blank" className="text-blue-300 underline">OneBox Dashboard</a></li>
                <li>查找"Deploy Contract"或"部署合约"功能</li>
                <li>上传编译后的合约文件</li>
              </ol>
            </div>

            {result && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
                <h2 className="text-xl font-bold mb-4">部署结果</h2>
                <pre className="bg-black/30 p-4 rounded overflow-auto text-sm">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}

            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg"
            >
              返回首页
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
