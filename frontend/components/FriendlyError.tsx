'use client';

import { AlertCircle, RefreshCw, Wallet, HelpCircle } from 'lucide-react';

interface FriendlyErrorProps {
  error: Error | string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

const ERROR_MESSAGES: Record<string, {
  title: string;
  description: string;
  solutions: string[];
  icon: 'wallet' | 'alert' | 'help';
}> = {
  'Invalid user signature': {
    title: '钱包签名错误',
    description: '你的钱包账户可能不匹配或需要重新连接',
    solutions: [
      '点击右上角断开钱包连接',
      '刷新页面（按 F5）',
      '重新连接钱包',
      '确保选择正确的账户'
    ],
    icon: 'wallet'
  },
  'InsufficientGas': {
    title: 'Gas 费用不足',
    description: '你的钱包余额不足以支付交易费用',
    solutions: [
      '检查钱包余额',
      '从水龙头获取测试币',
      '访问: https://faucet.sui.io/'
    ],
    icon: 'wallet'
  },
  'Package ID not configured': {
    title: '智能合约未配置',
    description: '游戏智能合约还未部署',
    solutions: [
      '请联系管理员部署合约',
      '或查看部署文档'
    ],
    icon: 'alert'
  },
  'Failed to fetch': {
    title: '网络连接失败',
    description: '无法连接到服务器',
    solutions: [
      '检查网络连接',
      '刷新页面重试',
      '稍后再试'
    ],
    icon: 'alert'
  },
  'User rejected': {
    title: '交易被取消',
    description: '你取消了钱包交易',
    solutions: [
      '如果想继续，请重新尝试',
      '在钱包弹窗中点击"批准"'
    ],
    icon: 'help'
  }
};

function getErrorInfo(error: Error | string) {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  // 查找匹配的错误类型
  for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
    if (errorMessage.includes(key)) {
      return value;
    }
  }
  
  // 默认错误信息
  return {
    title: '出错了',
    description: errorMessage,
    solutions: [
      '刷新页面重试',
      '如果问题持续，请联系支持'
    ],
    icon: 'alert' as const
  };
}

export function FriendlyError({ error, onRetry, onDismiss }: FriendlyErrorProps) {
  const errorInfo = getErrorInfo(error);
  
  const IconComponent = {
    wallet: Wallet,
    alert: AlertCircle,
    help: HelpCircle
  }[errorInfo.icon];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        {/* 图标和标题 */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <IconComponent className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {errorInfo.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {errorInfo.description}
            </p>
          </div>
        </div>

        {/* 解决方案 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            解决方法：
          </h4>
          <ol className="space-y-2">
            {errorInfo.solutions.map((solution, index) => (
              <li key={index} className="text-sm text-blue-800 dark:text-blue-200 flex gap-2">
                <span className="font-semibold">{index + 1}.</span>
                <span>{solution}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              重试
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition-colors"
            >
              关闭
            </button>
          )}
          {!onRetry && !onDismiss && (
            <button
              onClick={() => window.location.reload()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              刷新页面
            </button>
          )}
        </div>

        {/* 需要帮助链接 */}
        <div className="mt-4 text-center">
          <a
            href="#"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
          >
            还是不行？查看帮助文档
          </a>
        </div>
      </div>
    </div>
  );
}
