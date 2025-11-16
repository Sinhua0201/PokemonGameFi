'use client';

import { Loader2 } from 'lucide-react';

interface LoadingProgressProps {
  message?: string;
  submessage?: string;
  progress?: number; // 0-100
  steps?: {
    label: string;
    completed: boolean;
  }[];
}

export function LoadingProgress({ 
  message = '加载中...', 
  submessage,
  progress,
  steps 
}: LoadingProgressProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center max-w-md w-full px-4">
        {/* 旋转图标 */}
        <div className="mb-6">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto" />
        </div>

        {/* 主要消息 */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {message}
        </h3>

        {/* 次要消息 */}
        {submessage && (
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {submessage}
          </p>
        )}

        {/* 进度条 */}
        {progress !== undefined && (
          <div className="mb-6">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-blue-500 h-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {progress}%
            </p>
          </div>
        )}

        {/* 步骤列表 */}
        {steps && steps.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-left">
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    step.completed 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                  }`}>
                    {step.completed ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                  </div>
                  <span className={`text-sm ${
                    step.completed 
                      ? 'text-gray-900 dark:text-white font-medium' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 提示信息 */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
          💡 请不要关闭页面
        </p>
      </div>
    </div>
  );
}
