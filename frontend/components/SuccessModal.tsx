'use client';

import { CheckCircle, ArrowRight, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SuccessModalProps {
  title: string;
  message: string;
  details?: {
    label: string;
    value: string;
  }[];
  primaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  onClose?: () => void;
}

export function SuccessModal({
  title,
  message,
  details,
  primaryAction,
  secondaryAction,
  onClose
}: SuccessModalProps) {
  const router = useRouter();

  const handlePrimaryAction = () => {
    if (primaryAction?.onClick) {
      primaryAction.onClick();
    } else if (primaryAction?.href) {
      router.push(primaryAction.href);
    }
  };

  const handleSecondaryAction = () => {
    if (secondaryAction?.onClick) {
      secondaryAction.onClick();
    } else if (secondaryAction?.href) {
      router.push(secondaryAction.href);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        {/* 成功图标 */}
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-bounce-slow">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
        </div>

        {/* 标题 */}
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
          {title}
        </h2>

        {/* 消息 */}
        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
          {message}
        </p>

        {/* 详细信息 */}
        {details && details.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6 space-y-2">
            {details.map((detail, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {detail.label}
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {detail.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="space-y-3">
          {primaryAction && (
            <button
              onClick={handlePrimaryAction}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              {primaryAction.label}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          
          {secondaryAction && (
            <button
              onClick={handleSecondaryAction}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition-colors"
            >
              {secondaryAction.label}
            </button>
          )}

          {!primaryAction && !secondaryAction && (
            <button
              onClick={() => router.push('/')}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              <Home className="w-4 h-4" />
              返回首页
            </button>
          )}
        </div>

        {/* 关闭按钮 */}
        {onClose && (
          <button
            onClick={onClose}
            className="mt-4 w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
          >
            关闭
          </button>
        )}
      </div>
    </div>
  );
}
