'use client';

import { Info, X } from 'lucide-react';
import { useState } from 'react';

interface PageGuideProps {
  title: string;
  description: string;
  tips?: string[];
  storageKey?: string; // 用于记住用户是否关闭了提示
}

export function PageGuide({ title, description, tips, storageKey }: PageGuideProps) {
  const [isVisible, setIsVisible] = useState(() => {
    if (!storageKey) return true;
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(`guide-${storageKey}`) !== 'hidden';
  });

  const handleClose = () => {
    if (storageKey) {
      localStorage.setItem(`guide-${storageKey}`, 'hidden');
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6 animate-slide-in-left">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
            <Info className="w-5 h-5 text-white" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              📍 {title}
            </h3>
            {storageKey && (
              <button
                onClick={handleClose}
                className="flex-shrink-0 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                aria-label="关闭提示"
              >
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            {description}
          </p>
          
          {tips && tips.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                💡 小贴士：
              </p>
              <ul className="space-y-1">
                {tips.map((tip, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex gap-2">
                    <span className="text-blue-500">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
